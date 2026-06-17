"""
Funciones para generar alertas automáticamente según eventos del sistema.
Se llaman desde signals o desde el motor de scoring.
"""
from .models import Alerta


def alerta_pep_match(cliente, descripcion_extra=''):
    return Alerta.objects.create(
        cliente=cliente,
        tipo='pep_match',
        nivel_severidad='alta',
        descripcion=(
            f'El cliente {cliente.nombre_completo} tiene coincidencia en la lista PEP. '
            + descripcion_extra
        ),
    )


def alerta_alto_riesgo(cliente, score, expediente=None):
    return Alerta.objects.create(
        cliente=cliente,
        tipo='alto_riesgo',
        nivel_severidad='alta',
        descripcion=(
            f'El cliente {cliente.nombre_completo} obtuvo un score de riesgo {score}/100. '
            f'Se requiere revisión por Oficial de Cumplimiento.'
            + (f' Expediente: {expediente.codigo}' if expediente else '')
        ),
    )


def alerta_lista_restrictiva(cliente, lista_nombre):
    return Alerta.objects.create(
        cliente=cliente,
        tipo='actividad_sospechosa',
        nivel_severidad='alta',
        descripcion=(
            f'El cliente {cliente.nombre_completo} aparece en la lista restrictiva: {lista_nombre}. '
            f'Operaciones bloqueadas hasta resolución.'
        ),
    )


def alerta_documento_vencido(cliente, tipo_documento, expediente=None):
    return Alerta.objects.create(
        cliente=cliente,
        tipo='documento_vencido',
        nivel_severidad='media',
        descripcion=(
            f'El documento "{tipo_documento}" del cliente {cliente.nombre_completo} está vencido o pendiente de renovación.'
            + (f' Expediente: {expediente.codigo}' if expediente else '')
        ),
    )
