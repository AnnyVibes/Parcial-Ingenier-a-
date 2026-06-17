from django.db import models
from simple_history.models import HistoricalRecords


class PEP(models.Model):
    nombre_completo = models.CharField(max_length=255)
    cargo = models.CharField(max_length=255)
    pais = models.CharField(max_length=100)
    entidad = models.CharField(max_length=255, blank=True)
    fecha_inicio_cargo = models.DateField(null=True, blank=True)
    fecha_fin_cargo = models.DateField(null=True, blank=True)
    activo = models.BooleanField(default=True)
    fuente = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    history = HistoricalRecords()

    class Meta:
        verbose_name = 'PEP'
        verbose_name_plural = 'PEPs'
        ordering = ['nombre_completo']

    def __str__(self):
        return f"{self.nombre_completo} - {self.cargo} ({self.pais})"


class ListaRestrictiva(models.Model):
    TIPOS = [
        ('OFAC', 'OFAC - Office of Foreign Assets Control'),
        ('ONU', 'Lista de Sanciones ONU'),
        ('UE', 'Lista de Sanciones Unión Europea'),
        ('LOCAL', 'Lista Local'),
    ]

    nombre = models.CharField(max_length=255)
    tipo = models.CharField(max_length=10, choices=TIPOS)
    pais = models.CharField(max_length=100, blank=True)
    fundamento_legal = models.CharField(max_length=500, blank=True)
    fecha_inclusion = models.DateField(null=True, blank=True)
    activo = models.BooleanField(default=True)
    fuente = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    history = HistoricalRecords()

    class Meta:
        verbose_name = 'Lista Restrictiva'
        verbose_name_plural = 'Listas Restrictivas'
        ordering = ['nombre']

    def __str__(self):
        return f"{self.nombre} ({self.tipo})"
