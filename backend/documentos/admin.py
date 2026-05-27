from django.contrib import admin
from .models import Documento


@admin.register(Documento)
class DocumentoAdmin(admin.ModelAdmin):
    list_display = ['cliente', 'tipo', 'verificado', 'fecha_subida']
    list_filter = ['tipo', 'verificado']
