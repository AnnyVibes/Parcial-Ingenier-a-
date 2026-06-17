import os
import datetime
from django.http import FileResponse
from django.utils import timezone
from django.core.signing import TimestampSigner, BadSignature, SignatureExpired
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Documento
from .serializers import DocumentoSerializer
from accounts.permissions import IsAnalista

SIGNER = TimestampSigner()
EXPIRACION_ENLACE_SEGUNDOS = 3600  # 1 hora


class DocumentoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsAnalista]
    serializer_class = DocumentoSerializer
    parser_classes = [MultiPartParser, FormParser]
    filterset_fields = ['tipo', 'verificado', 'cliente', 'expediente']
    ordering = ['-fecha_subida']

    def get_queryset(self):
        return Documento.objects.select_related('cliente', 'expediente', 'subido_por').all()

    def perform_create(self, serializer):
        archivo = self.request.FILES.get('archivo')
        nombre_original = archivo.name if archivo else ''
        doc = serializer.save(
            subido_por=self.request.user,
            nombre_original=nombre_original,
            tamano_bytes=archivo.size if archivo else 0,
        )
        if archivo:
            doc.hash_archivo = doc.calcular_hash()
            doc.save(update_fields=['hash_archivo'])

    @action(detail=True, methods=['post'])
    def nueva_version(self, request, pk=None):
        """Sube una nueva versión de un documento existente, conservando el anterior."""
        doc_anterior = self.get_object()
        archivo = request.FILES.get('archivo')
        if not archivo:
            return Response({'detail': 'Se requiere el archivo.'}, status=status.HTTP_400_BAD_REQUEST)

        nueva_version = Documento.objects.create(
            cliente=doc_anterior.cliente,
            expediente=doc_anterior.expediente,
            tipo=doc_anterior.tipo,
            archivo=archivo,
            nombre_original=archivo.name,
            tamano_bytes=archivo.size,
            version=doc_anterior.version + 1,
            documento_anterior=doc_anterior,
            descripcion=request.data.get('descripcion', ''),
            subido_por=request.user,
        )
        nueva_version.hash_archivo = nueva_version.calcular_hash()
        nueva_version.save(update_fields=['hash_archivo'])

        return Response(DocumentoSerializer(nueva_version).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def enlace_temporal(self, request, pk=None):
        """Genera un enlace de descarga que expira en 1 hora."""
        doc = self.get_object()
        token = SIGNER.sign(str(doc.pk))
        url = request.build_absolute_uri(f'/api/documentos/descargar/{token}/')
        expira_en = timezone.now() + datetime.timedelta(seconds=EXPIRACION_ENLACE_SEGUNDOS)
        return Response({
            'url': url,
            'expira_en': expira_en.isoformat(),
            'valido_por': '1 hora',
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def verificar(self, request, pk=None):
        """Marca un documento como verificado por el analista."""
        doc = self.get_object()
        doc.verificado = True
        doc.verificado_por = request.user
        doc.save(update_fields=['verificado', 'verificado_por'])
        return Response(DocumentoSerializer(doc).data)

    @action(detail=True, methods=['get'])
    def versiones(self, request, pk=None):
        """Lista todas las versiones históricas de un documento."""
        doc = self.get_object()
        versiones = []
        actual = doc
        while actual:
            versiones.append(DocumentoSerializer(actual).data)
            actual = actual.documento_anterior
        return Response(versiones)
