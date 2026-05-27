from django.contrib import admin
from .models import Alerta


@admin.register(Alerta)
class AlertaAdmin(admin.ModelAdmin):
    list_display = ['cliente', 'tipo', 'estado', 'nivel_severidad', 'fecha_creacion']
    list_filter = ['tipo', 'estado', 'nivel_severidad']
