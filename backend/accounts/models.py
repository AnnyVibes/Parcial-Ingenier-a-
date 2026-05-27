from django.contrib.auth.models import AbstractUser
from django.db import models
from simple_history.models import HistoricalRecords


class User(AbstractUser):
    rol = models.CharField(max_length=50, choices=[
        ('admin', 'Administrador'),
        ('analista', 'Analista AML'),
        ('oficial', 'Oficial de Cumplimiento'),
        ('auditor', 'Auditor'),
    ], default='analista')
    telefono = models.CharField(max_length=20, blank=True)
    two_factor_enabled = models.BooleanField(default=False)
    history = HistoricalRecords()

    def __str__(self):
        return f"{self.username} - {self.get_rol_display()}"
