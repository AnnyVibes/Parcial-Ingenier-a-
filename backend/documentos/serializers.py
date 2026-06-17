from rest_framework import serializers
from .models import Documento, TIPOS_PERMITIDOS, TAMANO_MAXIMO_MB


class DocumentoSerializer(serializers.ModelSerializer):
    subido_por_nombre = serializers.CharField(source='subido_por.username', read_only=True)
    versiones_count = serializers.SerializerMethodField()

    class Meta:
        model = Documento
        fields = [
            'id', 'cliente', 'expediente', 'tipo', 'archivo', 'nombre_original',
            'hash_archivo', 'tamano_bytes', 'version', 'documento_anterior',
            'descripcion', 'verificado', 'verificado_por', 'fecha_subida',
            'subido_por', 'subido_por_nombre', 'versiones_count',
        ]
        read_only_fields = ['fecha_subida', 'hash_archivo', 'tamano_bytes', 'version', 'nombre_original']

    def get_versiones_count(self, obj):
        return obj.versiones_posteriores.count()

    def validate_archivo(self, value):
        content_type = getattr(value, 'content_type', '')
        if content_type and content_type not in TIPOS_PERMITIDOS:
            raise serializers.ValidationError(
                f'Tipo de archivo no permitido. Permitidos: PDF, JPG, PNG, WEBP.'
            )
        max_bytes = TAMANO_MAXIMO_MB * 1024 * 1024
        if value.size > max_bytes:
            raise serializers.ValidationError(
                f'El archivo supera el límite de {TAMANO_MAXIMO_MB}MB.'
            )
        return value
