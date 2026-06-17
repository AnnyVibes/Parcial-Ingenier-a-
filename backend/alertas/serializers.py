from rest_framework import serializers
from .models import Alerta


class AlertaSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.CharField(source='cliente.nombre_completo', read_only=True)
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    severidad_display = serializers.CharField(source='get_nivel_severidad_display', read_only=True)

    class Meta:
        model = Alerta
        fields = [
            'id', 'cliente', 'cliente_nombre', 'tipo', 'tipo_display',
            'estado', 'estado_display', 'descripcion', 'nivel_severidad',
            'severidad_display', 'asignado_a', 'fecha_creacion', 'fecha_resolucion',
        ]
        read_only_fields = ['fecha_creacion']
