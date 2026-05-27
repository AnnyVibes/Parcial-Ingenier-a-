from rest_framework import serializers
from .models import Expediente


class ExpedienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expediente
        fields = '__all__'
        read_only_fields = ['fecha_apertura']
