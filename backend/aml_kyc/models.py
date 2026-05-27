from django.db import models
from simple_history.models import HistoricalRecords


class EvaluacionRiesgo(models.Model):
    NIVELES = [
        ('bajo', 'Bajo'),
        ('medio', 'Medio'),
        ('alto', 'Alto'),
        ('critico', 'Crítico'),
    ]

    cliente = models.ForeignKey('clients.Cliente', on_delete=models.CASCADE, related_name='evaluaciones')
    expediente = models.ForeignKey('expedientes.Expediente', on_delete=models.CASCADE, related_name='evaluaciones')
    nivel_riesgo = models.CharField(max_length=10, choices=NIVELES, default='bajo')
    score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    fecha_evaluacion = models.DateTimeField(auto_now_add=True)
    evaluado_por = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)
    resultado_aml = models.JSONField(default=dict, blank=True)
    history = HistoricalRecords()

    class Meta:
        verbose_name = 'Evaluación de Riesgo'
        verbose_name_plural = 'Evaluaciones de Riesgo'

    def __str__(self):
        return f"{self.cliente} - {self.get_nivel_riesgo_display()} ({self.score})"
