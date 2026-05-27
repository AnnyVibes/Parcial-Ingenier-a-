from django.db import models


class AuditoriaLog(models.Model):
    ACCIONES = [
        ('creacion', 'Creación'),
        ('actualizacion', 'Actualización'),
        ('eliminacion', 'Eliminación'),
        ('consulta', 'Consulta'),
        ('login', 'Inicio de Sesión'),
        ('logout', 'Cierre de Sesión'),
    ]

    usuario = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)
    accion = models.CharField(max_length=20, choices=ACCIONES)
    modelo = models.CharField(max_length=100)
    objeto_id = models.CharField(max_length=50, blank=True)
    detalle = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Registro de Auditoría'
        verbose_name_plural = 'Registros de Auditoría'
        ordering = ['-fecha']

    def __str__(self):
        return f"{self.usuario} - {self.get_accion_display()} en {self.modelo} ({self.fecha})"
