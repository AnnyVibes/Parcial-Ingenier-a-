from django.contrib import admin
from .models import Workflow


@admin.register(Workflow)
class WorkflowAdmin(admin.ModelAdmin):
    list_display = ['expediente', 'estado_anterior', 'estado_nuevo', 'ejecutado_por', 'fecha']
    list_filter = ['estado_nuevo']
