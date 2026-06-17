"""
Middleware que registra automáticamente cada acción relevante del sistema.
Solo registra métodos que modifican datos (POST, PUT, PATCH, DELETE).
Las consultas GET no se auditan para evitar ruido.
"""

import json
from .models import AuditoriaLog

METODOS_AUDITADOS = {'POST', 'PUT', 'PATCH', 'DELETE'}

RUTAS_EXCLUIDAS = {
    '/api/schema/', '/api/docs/', '/admin/',
    '/api/accounts/token/', '/api/accounts/token/refresh/',
}

MAPA_MODELO = {
    'expedientes':  'Expediente',
    'clients':      'Cliente',
    'aml-kyc':      'EvaluacionRiesgo',
    'pep-lists':    'PEP',
    'workflow':     'Workflow',
    'documentos':   'Documento',
    'alertas':      'Alerta',
    'accounts':     'Usuario',
}

MAPA_ACCION = {
    'POST':   'creacion',
    'PUT':    'actualizacion',
    'PATCH':  'actualizacion',
    'DELETE': 'eliminacion',
}


def _obtener_ip(request):
    forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if forwarded:
        return forwarded.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


def _modelo_desde_path(path):
    for clave, modelo in MAPA_MODELO.items():
        if clave in path:
            return modelo
    return path.strip('/').split('/')[1] if path.count('/') >= 2 else 'Desconocido'


def _objeto_id_desde_path(path):
    partes = [p for p in path.strip('/').split('/') if p]
    for p in reversed(partes):
        if p.isdigit():
            return p
    return ''


class AuditoriaMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if (
            request.method in METODOS_AUDITADOS
            and not any(request.path.startswith(r) for r in RUTAS_EXCLUIDAS)
            and hasattr(request, 'user')
            and request.user.is_authenticated
            and 200 <= response.status_code < 300
        ):
            try:
                detalle = {}
                if request.content_type and 'json' in request.content_type:
                    try:
                        detalle = json.loads(request.body)
                    except Exception:
                        pass
                for campo in ('password', 'password2', 'old_password', 'new_password'):
                    detalle.pop(campo, None)

                AuditoriaLog.objects.create(
                    usuario=request.user,
                    accion=MAPA_ACCION.get(request.method, 'actualizacion'),
                    modelo=_modelo_desde_path(request.path),
                    objeto_id=_objeto_id_desde_path(request.path),
                    detalle=detalle,
                    ip_address=_obtener_ip(request),
                )
            except Exception:
                pass

        return response
