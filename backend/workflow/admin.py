from django.contrib import admin
from .models import Workflow


@admin.register(Workflow)
class WorkflowAdmin(admin.ModelAdmin):
    list_display = ['expediente', 'paso_actual', 'estado', 'asignado_a', 'fecha_inicio']
    list_filter = ['estado']
