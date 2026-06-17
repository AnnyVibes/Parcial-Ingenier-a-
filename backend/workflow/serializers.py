from rest_framework import serializers
from .models import Workflow, TRANSICIONES_VALIDAS, ROLES_POR_TRANSICION


class WorkflowSerializer(serializers.ModelSerializer):
    expediente_codigo = serializers.CharField(source='expediente.codigo', read_only=True)
    ejecutado_por_nombre = serializers.CharField(source='ejecutado_por.username', read_only=True)

    class Meta:
        model = Workflow
        fields = [
            'id', 'expediente', 'expediente_codigo', 'estado_anterior',
            'estado_nuevo', 'ejecutado_por', 'ejecutado_por_nombre',
            'comentarios', 'fecha',
        ]
        read_only_fields = ['fecha', 'estado_anterior', 'ejecutado_por']


class TransicionSerializer(serializers.Serializer):
    expediente_id = serializers.IntegerField()
    nuevo_estado = serializers.CharField()
    comentarios = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        from expedientes.models import Expediente
        try:
            expediente = Expediente.objects.get(pk=attrs['expediente_id'])
        except Expediente.DoesNotExist:
            raise serializers.ValidationError({'expediente_id': 'Expediente no encontrado.'})

        estado_actual = expediente.estado
        nuevo = attrs['nuevo_estado']

        if nuevo not in TRANSICIONES_VALIDAS.get(estado_actual, []):
            permitidos = TRANSICIONES_VALIDAS.get(estado_actual, [])
            raise serializers.ValidationError({
                'nuevo_estado': f"Transición inválida: '{estado_actual}' → '{nuevo}'. Permitidos: {permitidos}"
            })

        attrs['expediente'] = expediente
        return attrs
