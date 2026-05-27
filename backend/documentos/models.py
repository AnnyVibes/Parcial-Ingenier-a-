from django.db import models
from simple_history.models import HistoricalRecords


class Documento(models.Model):
    TIPOS = [
        ('cedula', 'Cédula'),
        ('certificado_bancario', 'Certificado Bancario'),
        ('declaracion_renta', 'Declaración de Renta'),
        ('camara_comercio', 'Cámara de Comercio'),
        ('otro', 'Otro'),
    ]

    cliente = models.ForeignKey('clients.Cliente', on_delete=models.CASCADE, related_name='documentos')
    expediente = models.ForeignKey('expedientes.Expediente', on_delete=models.SET_NULL, null=True, blank=True, related_name='documentos')
    tipo = models.CharField(max_length=50, choices=TIPOS)
    archivo = models.FileField(upload_to='documentos/%Y/%m/%d/')
    descripcion = models.TextField(blank=True)
    verificado = models.BooleanField(default=False)
    fecha_subida = models.DateTimeField(auto_now_add=True)
    subido_por = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)
    history = HistoricalRecords()

    class Meta:
        verbose_name = 'Documento'
        verbose_name_plural = 'Documentos'

    def __str__(self):
        return f"{self.cliente} - {self.get_tipo_display()}"
