from django.db import models
from django.utils import timezone
from simple_history.models import HistoricalRecords


class Expediente(models.Model):
    ESTADOS = [
        ('borrador', 'Borrador'),
        ('pendiente', 'Pendiente'),
        ('en_revision', 'En Revisión'),
        ('aprobado', 'Aprobado'),
        ('rechazado', 'Rechazado'),
        ('vencido', 'Vencido'),
    ]

    NIVEL_RIESGO = [
        ('bajo', 'Bajo'),
        ('medio', 'Medio'),
        ('alto', 'Alto'),
        ('critico', 'Crítico'),
    ]

    cliente = models.ForeignKey('clients.Cliente', on_delete=models.CASCADE, related_name='expedientes')
    analista = models.ForeignKey(
        'accounts.User', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='expedientes_asignados'
    )
    codigo = models.CharField(max_length=50, unique=True)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='borrador')
    nivel_riesgo = models.CharField(max_length=10, choices=NIVEL_RIESGO, default='bajo')
    fecha_apertura = models.DateTimeField(auto_now_add=True)
    fecha_cierre = models.DateTimeField(null=True, blank=True)
    fecha_vencimiento = models.DateField(null=True, blank=True)
    notas = models.TextField(blank=True)
    motivo_rechazo = models.TextField(blank=True)
    history = HistoricalRecords()

    class Meta:
        verbose_name = 'Expediente'
        verbose_name_plural = 'Expedientes'
        ordering = ['-fecha_apertura']

    def __str__(self):
        return f"{self.codigo} - {self.cliente.nombre_completo}"

    def esta_vencido(self):
        if self.fecha_vencimiento and self.estado == 'aprobado':
            return timezone.now().date() > self.fecha_vencimiento
        return False
