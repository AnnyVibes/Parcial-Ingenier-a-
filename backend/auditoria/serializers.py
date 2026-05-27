from rest_framework import serializers
from .models import AuditoriaLog


class AuditoriaLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditoriaLog
        fields = '__all__'
        read_only_fields = ['fecha']
