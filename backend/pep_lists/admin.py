from django.contrib import admin
from .models import PEP


@admin.register(PEP)
class PEPAdmin(admin.ModelAdmin):
    list_display = ['nombre_completo', 'cargo', 'pais', 'activo']
    list_filter = ['pais', 'activo']
    search_fields = ['nombre_completo', 'cargo']
