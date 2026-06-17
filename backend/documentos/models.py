import hashlib
import os
from django.db import models
from simple_history.models import HistoricalRecords

TIPOS_PERMITIDOS = {'application/pdf', 'image/jpeg', 'image/png', 'image/webp'}
TAMANO_MAXIMO_MB = 10


class Documento(models.Model):
    TIPOS = [
        ('cedula', 'Cédula'),
        ('rif_nit', 'RIF / NIT'),
        ('acta_constitutiva', 'Acta Constitutiva'),
        ('estados_financieros', 'Estados Financieros'),
        ('referencia_bancaria', 'Referencia Bancaria'),
        ('certificado_bancario', 'Certificado Bancario'),
        ('declaracion_renta', 'Declaración de Renta'),
        ('camara_comercio', 'Cámara de Comercio'),
        ('contrato', 'Contrato'),
        ('otro', 'Otro'),
    ]

    cliente = models.ForeignKey('clients.Cliente', on_delete=models.CASCADE, related_name='documentos')
    expediente = models.ForeignKey(
        'expedientes.Expediente', on_delete=models.SET_NULL, null=True, blank=True, related_name='documentos'
    )
    tipo = models.CharField(max_length=50, choices=TIPOS)
    archivo = models.FileField(upload_to='documentos/%Y/%m/%d/')
    nombre_original = models.CharField(max_length=255, blank=True)
    hash_archivo = models.CharField(max_length=64, blank=True)
    tamano_bytes = models.PositiveIntegerField(default=0)
    version = models.PositiveIntegerField(default=1)
    documento_anterior = models.ForeignKey(
        'self', on_delete=models.SET_NULL, null=True, blank=True, related_name='versiones_posteriores'
    )
    descripcion = models.TextField(blank=True)
    verificado = models.BooleanField(default=False)
    verificado_por = models.ForeignKey(
        'accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='documentos_verificados'
    )
    fecha_subida = models.DateTimeField(auto_now_add=True)
    subido_por = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, related_name='documentos_subidos')
    history = HistoricalRecords()

    class Meta:
        verbose_name = 'Documento'
        verbose_name_plural = 'Documentos'
        ordering = ['-fecha_subida']

    def __str__(self):
        return f"{self.cliente} - {self.get_tipo_display()} v{self.version}"

    def calcular_hash(self):
        if self.archivo:
            sha256 = hashlib.sha256()
            for chunk in self.archivo.chunks():
                sha256.update(chunk)
            return sha256.hexdigest()
        return ''
