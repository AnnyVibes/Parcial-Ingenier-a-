from django.db import models
from simple_history.models import HistoricalRecords


class Alerta(models.Model):
    TIPOS = [
        ('pep_match', 'Coincidencia PEP'),
        ('alto_riesgo', 'Alto Riesgo'),
        ('documento_vencido', 'Documento Vencido'),
        ('actividad_sospechosa', 'Actividad Sospechosa'),
        ('otro', 'Otro'),
    ]

    ESTADOS = [
        ('nueva', 'Nueva'),
        ('en_revision', 'En Revisión'),
        ('resuelta', 'Resuelta'),
        ('falso_positivo', 'Falso Positivo'),
    ]

    cliente = models.ForeignKey('clients.Cliente', on_delete=models.CASCADE, related_name='alertas')
    tipo = models.CharField(max_length=30, choices=TIPOS)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='nueva')
    descripcion = models.TextField()
    nivel_severidad = models.CharField(max_length=10, choices=[
        ('baja', 'Baja'),
        ('media', 'Media'),
        ('alta', 'Alta'),
    ], default='media')
    asignado_a = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_resolucion = models.DateTimeField(null=True, blank=True)
    history = HistoricalRecords()

    class Meta:
        verbose_name = 'Alerta'
        verbose_name_plural = 'Alertas'
        ordering = ['-fecha_creacion']

    def __str__(self):
        return f"{self.get_tipo_display()} - {self.cliente} ({self.get_estado_display()})"
