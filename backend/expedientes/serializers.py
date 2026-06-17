from rest_framework import serializers
from .models import Expediente
from accounts.serializers import UserSerializer
from clients.serializers import ClienteSerializer


class ExpedienteSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.CharField(source='cliente.nombre_completo', read_only=True)
    analista_nombre = serializers.CharField(source='analista.get_full_name', read_only=True)
    esta_vencido = serializers.BooleanField(read_only=True)

    class Meta:
        model = Expediente
        fields = [
            'id', 'codigo', 'cliente', 'cliente_nombre', 'analista', 'analista_nombre',
            'estado', 'nivel_riesgo', 'fecha_apertura', 'fecha_cierre',
            'fecha_vencimiento', 'notas', 'motivo_rechazo', 'esta_vencido',
        ]
        read_only_fields = ['fecha_apertura', 'codigo']


class ExpedienteDetalleSerializer(ExpedienteSerializer):
    cliente = ClienteSerializer(read_only=True)
    analista = UserSerializer(read_only=True)


class AsignarAnalistaSerializer(serializers.Serializer):
    analista_id = serializers.IntegerField()

    def validate_analista_id(self, value):
        from accounts.models import User
        try:
            user = User.objects.get(pk=value, rol__in=['analista', 'oficial', 'admin'])
        except User.DoesNotExist:
            raise serializers.ValidationError('El usuario no existe o no tiene rol de analista.')
        return value
