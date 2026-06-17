"""
API MVP: sirve EXACTAMENTE el contrato que consume frontend-admin.
Traduce desde los modelos reales del backend usando mvp/mappers.py.
"""
from django.core.signing import TimestampSigner, BadSignature, SignatureExpired
from django.utils import timezone
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import User
from clients.models import Cliente
from expedientes.models import Expediente
from aml_kyc.models import EvaluacionRiesgo
from alertas.models import Alerta
from auditoria.models import AuditoriaLog
from workflow.models import Workflow, TRANSICIONES_VALIDAS
from aml_kyc.scoring import calcular_score

from . import mappers
from .models import Observacion

_signer = TimestampSigner()


def _tokens_para(user):
    refresh = RefreshToken.for_user(user)
    refresh['rol'] = user.rol
    return {'access': str(refresh.access_token), 'refresh': str(refresh)}


# ───────────────────────── AUTH ─────────────────────────
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    email = (request.data.get('email') or '').strip()
    password = request.data.get('password') or ''
    user = User.objects.filter(Q(email__iexact=email) | Q(username__iexact=email)).first()

    if not user or not user.check_password(password):
        return Response({'detail': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)
    if not user.is_active:
        return Response({'detail': 'Cuenta deshabilitada'}, status=status.HTTP_403_FORBIDDEN)

    if user.two_factor_enabled:
        temp = _signer.sign(str(user.id))
        return Response({'requires_mfa': True, 'temp_token': temp})

    user.last_login = timezone.now()
    user.save(update_fields=['last_login'])
    AuditoriaLog.objects.create(usuario=user, accion='login', modelo='Usuario',
                                objeto_id=str(user.id), detalle={'via': 'login'})
    return Response({
        'requires_mfa': False,
        **_tokens_para(user),
        'user': mappers.usuario_front(user),
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def mfa_verify(request):
    temp_token = request.data.get('temp_token') or ''
    code = request.data.get('code') or ''
    try:
        user_id = _signer.unsign(temp_token, max_age=300)
    except (BadSignature, SignatureExpired):
        return Response({'detail': 'Token temporal inválido o expirado'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.filter(pk=user_id).first()
    if not user:
        return Response({'detail': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    # ponytail: en MVP el codigo MFA demo es fijo; integrar TOTP real es post-MVP.
    if code != '123456':
        return Response({'detail': 'Código MFA inválido', 'temp_token': _signer.sign(str(user.id))},
                        status=status.HTTP_400_BAD_REQUEST)

    user.last_login = timezone.now()
    user.save(update_fields=['last_login'])
    return Response({**_tokens_para(user), 'user': mappers.usuario_front(user)})


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset(request):
    return Response({'ok': True})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(mappers.usuario_front(request.user))


# ──────────────────── EXPEDIENTES ────────────────────
def _paginar(request, items):
    try:
        page = max(1, int(request.query_params.get('page', 1)))
    except ValueError:
        page = 1
    try:
        size = min(100, max(1, int(request.query_params.get('page_size', 25))))
    except ValueError:
        size = 25
    total = len(items)
    start = (page - 1) * size
    end = start + size
    base = request.build_absolute_uri(request.path)
    return {
        'count': total,
        'next': f'{base}?page={page + 1}' if end < total else None,
        'previous': f'{base}?page={page - 1}' if page > 1 else None,
        'results': items[start:end],
    }


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def expedientes_list(request):
    qs = Expediente.objects.select_related('cliente', 'analista').prefetch_related('evaluaciones')

    search = request.query_params.get('search')
    if search:
        qs = qs.filter(Q(codigo__icontains=search) | Q(cliente__nombre_completo__icontains=search))

    estado = request.query_params.get('estado')
    if estado:
        qs = qs.filter(estado=mappers.ESTADO_A_BACK.get(estado, estado))

    riesgo = request.query_params.get('riesgo')
    if riesgo:
        niveles = ['alto', 'critico'] if riesgo == 'ALTO' else [mappers.RIESGO_A_BACK.get(riesgo, riesgo.lower())]
        qs = qs.filter(nivel_riesgo__in=niveles)

    items = [mappers.expediente_front(e) for e in qs]
    return Response(_paginar(request, items))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def expediente_detail(request, pk):
    exp = Expediente.objects.select_related('cliente', 'analista').filter(pk=pk).first()
    if not exp:
        return Response({'detail': 'Expediente no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    return Response(mappers.expediente_front(exp))


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def expediente_estado(request, pk):
    exp = Expediente.objects.select_related('cliente').filter(pk=pk).first()
    if not exp:
        return Response({'detail': 'Expediente no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    nuevo_front = request.data.get('estado')
    nuevo_back = mappers.ESTADO_A_BACK.get(nuevo_front)
    if not nuevo_back:
        return Response({'detail': f'Estado inválido: {nuevo_front}'}, status=status.HTTP_400_BAD_REQUEST)

    permitidos = TRANSICIONES_VALIDAS.get(exp.estado, [])
    if nuevo_back != exp.estado and nuevo_back not in permitidos:
        return Response(
            {'detail': f'Transición no permitida: {exp.estado} → {nuevo_back}'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    anterior = exp.estado
    exp.estado = nuevo_back
    if nuevo_back == 'aprobado':
        exp.fecha_cierre = timezone.now()
    exp.save(update_fields=['estado', 'fecha_cierre'])

    Workflow.objects.create(
        expediente=exp, estado_anterior=anterior, estado_nuevo=nuevo_back,
        ejecutado_por=request.user, comentarios=request.data.get('observacion', ''),
    )
    return Response(mappers.expediente_front(exp))


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def expediente_recalcular_riesgo(request, pk):
    exp = Expediente.objects.select_related('cliente').filter(pk=pk).first()
    if not exp:
        return Response({'detail': 'Expediente no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    resultado = calcular_score(exp.cliente, exp)
    EvaluacionRiesgo.objects.create(
        cliente=exp.cliente, expediente=exp, evaluado_por=request.user,
        score=resultado['score'], nivel_riesgo=resultado['nivel'], resultado_aml=resultado,
    )
    exp.nivel_riesgo = resultado['nivel']
    exp.save(update_fields=['nivel_riesgo'])
    return Response(mappers.expediente_front(exp))


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def expediente_generar_acceso(request, pk):
    exp = Expediente.objects.filter(pk=pk).first()
    if not exp:
        return Response({'detail': 'Expediente no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    token = _signer.sign(f'exp:{exp.id}')
    url = f'http://localhost:5174/formulario/{token}'
    return Response({'token': token, 'url': url})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def expediente_documentos(request, pk):
    exp = Expediente.objects.filter(pk=pk).first()
    if not exp:
        return Response({'detail': 'Expediente no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    docs = exp.documentos.all()
    return Response([mappers.documento_front(d) for d in docs])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def expediente_historial(request, pk):
    exp = Expediente.objects.filter(pk=pk).first()
    if not exp:
        return Response({'detail': 'Expediente no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    movimientos = exp.workflows.select_related('ejecutado_por').all()
    return Response([mappers.historial_front(w) for w in movimientos])


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def expediente_observaciones(request, pk):
    exp = Expediente.objects.filter(pk=pk).first()
    if not exp:
        return Response({'detail': 'Expediente no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'POST':
        texto = (request.data.get('texto') or '').strip()
        if not texto:
            return Response({'detail': 'El texto es obligatorio'}, status=status.HTTP_400_BAD_REQUEST)
        obs = Observacion.objects.create(expediente=exp, autor=request.user, texto=texto)
        return Response(mappers.observacion_front(obs), status=status.HTTP_201_CREATED)

    obs = exp.observaciones_mvp.select_related('autor').all()
    return Response([mappers.observacion_front(o) for o in obs])


# ──────────────────── DASHBOARD ────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    qs = Expediente.objects.all()
    total = qs.count()
    aprobados = qs.filter(estado='aprobado').count()
    alto_riesgo = qs.filter(nivel_riesgo__in=['alto', 'critico']).count()

    hoy = timezone.now().date()
    en_30_dias = hoy + timezone.timedelta(days=30)
    pendientes_renovacion = qs.filter(
        estado='aprobado', fecha_vencimiento__isnull=False, fecha_vencimiento__lte=en_30_dias
    ).count()

    distribucion = {
        'bajo': qs.filter(nivel_riesgo='bajo').count(),
        'medio': qs.filter(nivel_riesgo='medio').count(),
        'alto': qs.filter(nivel_riesgo__in=['alto', 'critico']).count(),
    }

    actividad = [
        {
            'id': log.id,
            'usuario': log.usuario.get_full_name() if log.usuario else 'Sistema',
            'accion': log.detalle.get('descripcion') or log.get_accion_display(),
            'fecha': log.fecha.isoformat(),
        }
        for log in AuditoriaLog.objects.select_related('usuario').all()[:8]
    ]

    # Estadisticas mensuales: ultimos 6 meses
    mensuales = []
    meses_es = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    for i in range(5, -1, -1):
        ref = (hoy.replace(day=1) - timezone.timedelta(days=i * 30))
        creados = qs.filter(fecha_apertura__year=ref.year, fecha_apertura__month=ref.month).count()
        aprob = qs.filter(fecha_cierre__year=ref.year, fecha_cierre__month=ref.month, estado='aprobado').count()
        mensuales.append({'mes': meses_es[ref.month - 1], 'creados': creados, 'aprobados': aprob})

    return Response({
        'total_expedientes': total,
        'pendientes_renovacion': pendientes_renovacion,
        'aprobados': aprobados,
        'alto_riesgo': alto_riesgo,
        'actividad_reciente': actividad,
        'distribucion_riesgo': distribucion,
        'estadisticas_mensuales': mensuales,
    })


# ──────────────────── ALERTAS ────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def alertas_list(request):
    qs = Alerta.objects.select_related('cliente').all()
    tipo = request.query_params.get('tipo')
    if tipo:
        back_tipos = [k for k, v in mappers.TIPO_ALERTA_A_FRONT.items() if v == tipo]
        qs = qs.filter(tipo__in=back_tipos)
    return Response([mappers.alerta_front(a) for a in qs])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def alertas_activas_count(request):
    return Response({'count': Alerta.objects.filter(estado='nueva').count()})


# ──────────────────── AUDITORIA ────────────────────
# ──────────────────── FORMULARIO PUBLICO (KYC) ────────────────────
def _tipo_desde_token(token):
    return 'JURIDICA' if 'juridica' in token.lower() else 'NATURAL'


@api_view(['GET'])
@permission_classes([AllowAny])
def formulario_public_info(request, token):
    return Response({
        'token': token,
        'tipo': _tipo_desde_token(token),
        'cliente_sugerido': '',
        'creado': timezone.now().isoformat(),
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def formulario_public_submit(request):
    token = request.headers.get('X-Form-Token', '')
    data = request.data or {}
    nombre = (
        data.get('nombre_razon_social')
        or data.get('nombre_completo')
        or data.get('razon_social')
        or 'Cliente sin nombre'
    )
    tipo = _tipo_desde_token(token)
    tipo_doc = 'NIT' if tipo == 'JURIDICA' else 'CC'

    n = Cliente.objects.count() + 1
    cliente = Cliente.objects.create(
        tipo_documento=tipo_doc,
        numero_documento=str(data.get('numero_documento') or f'{tipo_doc}-PUB-{n}'),
        nombre_completo=nombre,
        email=data.get('email') or f'pub{n}@ejemplo.test',
        telefono=str(data.get('telefono') or ''),
        nacionalidad=data.get('nacionalidad') or 'PA',
        occupation=data.get('occupation') or '',
        income_range=data.get('income_range') or '',
    )
    codigo = f'EXP-2026-{1000 + Expediente.objects.count() + 1:04d}'
    exp = Expediente.objects.create(
        cliente=cliente, codigo=codigo, estado='pendiente', nivel_riesgo='bajo',
    )
    # Evaluacion inicial automatica
    resultado = calcular_score(cliente, exp)
    EvaluacionRiesgo.objects.create(
        cliente=cliente, expediente=exp, score=resultado['score'],
        nivel_riesgo=resultado['nivel'], resultado_aml=resultado,
    )
    exp.nivel_riesgo = resultado['nivel']
    exp.save(update_fields=['nivel_riesgo'])

    return Response({'ok': True, 'expediente_numero': codigo}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def auditoria_log(request):
    AuditoriaLog.objects.create(
        usuario=request.user,
        accion='consulta',
        modelo='Expediente',
        objeto_id=str(request.data.get('expediente_id') or ''),
        detalle={
            'descripcion': request.data.get('accion', 'evento'),
            'resultado': request.data.get('resultado'),
            **(request.data.get('detalles') or {}),
        },
    )
    return Response({'ok': True})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def auditoria_logs(request):
    logs = AuditoriaLog.objects.select_related('usuario').all()
    items = [
        {
            'id': log.id,
            'accion': (log.detalle or {}).get('descripcion') or log.get_accion_display(),
            'usuario': log.usuario.get_full_name() if log.usuario else 'Sistema',
            'fecha': log.fecha.isoformat(),
            'expediente_id': int(log.objeto_id) if log.objeto_id.isdigit() else None,
            'detalles': log.detalle,
        }
        for log in logs
    ]
    return Response(_paginar(request, items))


# ──────────────────── USUARIOS ────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def usuarios_list(request):
    items = [mappers.usuario_front(u) for u in User.objects.all().order_by('id')]
    return Response(_paginar(request, items))
