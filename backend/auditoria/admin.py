from django.contrib import admin
from .models import AuditoriaLog


@admin.register(AuditoriaLog)
class AuditoriaLogAdmin(admin.ModelAdmin):
    list_display = ['usuario', 'accion', 'modelo', 'fecha']
    list_filter = ['accion', 'fecha']
    readonly_fields = ['usuario', 'accion', 'modelo', 'objeto_id', 'detalle', 'ip_address', 'fecha']
