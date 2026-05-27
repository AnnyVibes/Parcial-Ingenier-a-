from django.contrib import admin
from .models import Expediente


@admin.register(Expediente)
class ExpedienteAdmin(admin.ModelAdmin):
    list_display = ['codigo', 'cliente', 'estado', 'fecha_apertura']
    list_filter = ['estado']
    search_fields = ['codigo', 'cliente__nombre_completo']
