from rest_framework import serializers
from .models import AuditoriaLog


class AuditoriaLogSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(source='usuario.username', read_only=True)
    accion_display = serializers.CharField(source='get_accion_display', read_only=True)

    class Meta:
        model = AuditoriaLog
        fields = [
            'id', 'usuario', 'usuario_nombre', 'accion', 'accion_display',
            'modelo', 'objeto_id', 'detalle', 'ip_address', 'fecha',
        ]
        read_only_fields = ['fecha']
