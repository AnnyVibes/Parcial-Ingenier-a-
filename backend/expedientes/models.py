from django.db import models
from simple_history.models import HistoricalRecords


class Expediente(models.Model):
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('en_revision', 'En Revisión'),
        ('completado', 'Completado'),
        ('rechazado', 'Rechazado'),
    ]

    cliente = models.ForeignKey('clients.Cliente', on_delete=models.CASCADE, related_name='expedientes')
    codigo = models.CharField(max_length=50, unique=True)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')
    fecha_apertura = models.DateTimeField(auto_now_add=True)
    fecha_cierre = models.DateTimeField(null=True, blank=True)
    notas = models.TextField(blank=True)
    history = HistoricalRecords()

    class Meta:
        verbose_name = 'Expediente'
        verbose_name_plural = 'Expedientes'

    def __str__(self):
        return f"{self.codigo} - {self.cliente.nombre_completo}"
