from rest_framework import serializers
from .models import PEP


class PEPSerializer(serializers.ModelSerializer):
    class Meta:
        model = PEP
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
