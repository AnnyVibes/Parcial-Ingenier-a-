"""
Traduccion entre los modelos del backend (enums en minuscula, FKs)
y el contrato que espera el frontend (enums en MAYUSCULA, objetos aplanados).
Una sola fuente de verdad para los mapeos, asi no se desincronizan.
"""

# ---- Roles: backend <-> frontend ----
ROL_A_FRONT = {
    'admin': 'ADMINISTRADOR',
    'oficial': 'OFICIAL_CUMPLIMIENTO',
    'analista': 'COLABORADOR',
    'auditor': 'AUDITOR',
}
ROL_A_BACK = {v: k for k, v in ROL_A_FRONT.items()}

# ---- Estado de expediente: backend <-> frontend ----
# El front no maneja 'borrador' ni 'vencido' como tales: borrador->PENDIENTE, vencido->APROBADO.
ESTADO_A_FRONT = {
    'borrador': 'PENDIENTE',
    'pendiente': 'PENDIENTE',
    'en_revision': 'EN_REVISION',
    'aprobado': 'APROBADO',
    'rechazado': 'RECHAZADO',
    'vencido': 'APROBADO',
}
ESTADO_A_BACK = {
    'FORMULARIO_PUBLICO': 'borrador',
    'PENDIENTE': 'pendiente',
    'EN_REVISION': 'en_revision',
    'APROBADO': 'aprobado',
    'RECHAZADO': 'rechazado',
}

# ---- Nivel de riesgo: backend (4 niveles) -> frontend (3 niveles) ----
RIESGO_A_FRONT = {
    'bajo': 'BAJO',
    'medio': 'MEDIO',
    'alto': 'ALTO',
    'critico': 'ALTO',
}
RIESGO_A_BACK = {
    'BAJO': 'bajo',
    'MEDIO': 'medio',
    'ALTO': 'alto',
}


def rol_front(rol_back):
    return ROL_A_FRONT.get(rol_back, 'COLABORADOR')


def usuario_front(user):
    return {
        'id': user.id,
        'email': user.email or user.username,
        'nombre': user.get_full_name() or user.username,
        'rol': rol_front(user.rol),
        'activo': user.is_active,
        'ultimo_login': user.last_login.isoformat() if user.last_login else None,
    }


def _iso(dt):
    return dt.isoformat() if dt else None


def expediente_front(exp):
    """Modelo Expediente (con cliente FK) -> shape plano del frontend."""
    cliente = exp.cliente
    evaluacion = exp.evaluaciones.order_by('-fecha_evaluacion').first()
    score = float(evaluacion.score) if evaluacion else 0.0
    factores = []
    if evaluacion and isinstance(evaluacion.resultado_aml, dict):
        factores = evaluacion.resultado_aml.get('factores_activados', [])

    tipo_cliente = 'JURIDICA' if cliente.tipo_documento == 'NIT' else 'NATURAL'

    return {
        'id': exp.id,
        'codigo': exp.codigo,
        'nombre_razon_social': cliente.nombre_completo,
        'tipo_cliente': tipo_cliente,
        'ultima_renovacion': _iso(exp.fecha_apertura),
        'proxima_renovacion': exp.fecha_vencimiento.isoformat() if exp.fecha_vencimiento else None,
        'estado': ESTADO_A_FRONT.get(exp.estado, 'PENDIENTE'),
        'nivel_riesgo': RIESGO_A_FRONT.get(exp.nivel_riesgo, 'BAJO'),
        'score_riesgo': score,
        'creado_por': exp.analista_id,
        'creado_en': _iso(exp.fecha_apertura),
        'factores_riesgo': factores,
    }


def documento_front(doc):
    return {
        'id': doc.id,
        'nombre': doc.nombre_original or f'{doc.get_tipo_display()}',
        'tipo': doc.get_tipo_display(),
        'tamano': doc.tamano_bytes,
        'url_descarga': doc.archivo.url if doc.archivo else '',
        'fecha_subida': _iso(doc.fecha_subida),
    }


def historial_front(wf):
    return {
        'id': wf.id,
        'fecha': _iso(wf.fecha),
        'estado': ESTADO_A_FRONT.get(wf.estado_nuevo, 'PENDIENTE'),
        'usuario': wf.ejecutado_por.get_full_name() if wf.ejecutado_por else 'Sistema',
        'notas': wf.comentarios,
    }


def observacion_front(obs):
    return {
        'id': obs.id,
        'autor': obs.autor.get_full_name() if obs.autor else 'Anónimo',
        'fecha': _iso(obs.fecha),
        'texto': obs.texto,
    }


# ---- Alertas ----
TIPO_ALERTA_A_FRONT = {
    'pep_match': 'ALTO_RIESGO',
    'alto_riesgo': 'ALTO_RIESGO',
    'documento_vencido': 'DOC_PENDIENTE',
    'actividad_sospechosa': 'ALTO_RIESGO',
    'otro': 'RENOVACION',
}
SEVERIDAD_A_FRONT = {'baja': 'BAJA', 'media': 'MEDIA', 'alta': 'ALTA'}


def alerta_front(alerta):
    exp = alerta.cliente.expedientes.first()
    return {
        'id': alerta.id,
        'tipo': TIPO_ALERTA_A_FRONT.get(alerta.tipo, 'RENOVACION'),
        'expediente_id': exp.id if exp else 0,
        'expediente_nombre': alerta.cliente.nombre_completo,
        'mensaje': alerta.descripcion,
        'fecha': _iso(alerta.fecha_creacion),
        'prioridad': SEVERIDAD_A_FRONT.get(alerta.nivel_severidad, 'MEDIA'),
    }
