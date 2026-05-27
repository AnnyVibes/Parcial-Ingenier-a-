from django.db import models
from simple_history.models import HistoricalRecords


class Workflow(models.Model):
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('en_progreso', 'En Progreso'),
        ('aprobado', 'Aprobado'),
        ('rechazado', 'Rechazado'),
    ]

    expediente = models.ForeignKey('expedientes.Expediente', on_delete=models.CASCADE, related_name='workflows')
    paso_actual = models.CharField(max_length=100)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')
    asignado_a = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True)
    comentarios = models.TextField(blank=True)
    fecha_inicio = models.DateTimeField(auto_now_add=True)
    fecha_fin = models.DateTimeField(null=True, blank=True)
    history = HistoricalRecords()

    class Meta:
        verbose_name = 'Workflow'
        verbose_name_plural = 'Workflows'

    def __str__(self):
        return f"{self.expediente.codigo} - {self.paso_actual} ({self.get_estado_display()})"
