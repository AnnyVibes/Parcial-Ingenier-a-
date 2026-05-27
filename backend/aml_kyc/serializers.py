from rest_framework import serializers
from .models import EvaluacionRiesgo


class EvaluacionRiesgoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluacionRiesgo
        fields = '__all__'
        read_only_fields = ['fecha_evaluacion']
