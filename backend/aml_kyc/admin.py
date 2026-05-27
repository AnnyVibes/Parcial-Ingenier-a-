from django.contrib import admin
from .models import EvaluacionRiesgo


@admin.register(EvaluacionRiesgo)
class EvaluacionRiesgoAdmin(admin.ModelAdmin):
    list_display = ['cliente', 'nivel_riesgo', 'score', 'fecha_evaluacion']
    list_filter = ['nivel_riesgo']
