from django.db import models
from simple_history.models import HistoricalRecords


class Cliente(models.Model):
    TIPO_DOCUMENTO = [
        ('CC', 'Cédula de Ciudadanía'),
        ('CE', 'Cédula de Extranjería'),
        ('NIT', 'NIT'),
        ('PASAPORTE', 'Pasaporte'),
    ]

    tipo_documento = models.CharField(max_length=10, choices=TIPO_DOCUMENTO)
    numero_documento = models.CharField(max_length=30, unique=True)
    nombre_completo = models.CharField(max_length=255)
    email = models.EmailField()
    telefono = models.CharField(max_length=20)
    direccion = models.TextField(blank=True)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    nacionalidad = models.CharField(max_length=100, blank=True)
    occupation = models.CharField(max_length=200, blank=True)
    income_range = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    history = HistoricalRecords()

    class Meta:
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'

    def __str__(self):
        return f"{self.nombre_completo} ({self.tipo_documento}: {self.numero_documento})"
