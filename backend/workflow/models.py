from django.db import models
from django.utils import timezone
from simple_history.models import HistoricalRecords


# Transiciones válidas: estado_actual -> [estados_permitidos]
TRANSICIONES_VALIDAS = {
    'borrador':    ['pendiente'],
    'pendiente':   ['en_revision', 'rechazado'],
    'en_revision': ['aprobado', 'rechazado'],
    'aprobado':    ['vencido'],
    'rechazado':   ['borrador'],
    'vencido':     ['pendiente'],
}

# Roles que pueden ejecutar cada transición
ROLES_POR_TRANSICION = {
    ('borrador', 'pendiente'):      ['admin', 'oficial', 'analista'],
    ('pendiente', 'en_revision'):   ['admin', 'oficial', 'analista'],
    ('pendiente', 'rechazado'):     ['admin', 'oficial'],
    ('en_revision', 'aprobado'):    ['admin', 'oficial'],
    ('en_revision', 'rechazado'):   ['admin', 'oficial'],
    ('aprobado', 'vencido'):        ['admin'],
    ('rechazado', 'borrador'):      ['admin', 'oficial', 'analista'],
    ('vencido', 'pendiente'):       ['admin', 'oficial', 'analista'],
}


class Workflow(models.Model):
    expediente = models.ForeignKey('expedientes.Expediente', on_delete=models.CASCADE, related_name='workflows')
    estado_anterior = models.CharField(max_length=20, blank=True)
    estado_nuevo = models.CharField(max_length=20)
    ejecutado_por = models.ForeignKey(
        'accounts.User', on_delete=models.SET_NULL, null=True, related_name='transiciones'
    )
    comentarios = models.TextField(blank=True)
    fecha = models.DateTimeField(auto_now_add=True)
    history = HistoricalRecords()

    class Meta:
        verbose_name = 'Movimiento de Workflow'
        verbose_name_plural = 'Movimientos de Workflow'
        ordering = ['-fecha']

    def __str__(self):
        return f"{self.expediente.codigo}: {self.estado_anterior} → {self.estado_nuevo} ({self.fecha:%Y-%m-%d})"
