import csv
import io
from django.db.models import Q
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import PEP, ListaRestrictiva
from .serializers import PEPSerializer, ListaRestrictivaSerializer
from accounts.permissions import IsAdmin, IsAnalista


def _similitud_nombre(nombre1, nombre2):
    """Comprobación simple de similitud: palabras clave en común."""
    palabras1 = set(nombre1.lower().split())
    palabras2 = set(nombre2.lower().split())
    comunes = palabras1 & palabras2
    if not palabras1:
        return 0
    return len(comunes) / len(palabras1)


class PEPViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsAnalista]
    serializer_class = PEPSerializer
    search_fields = ['nombre_completo', 'cargo', 'pais', 'entidad']
    filterset_fields = ['pais', 'activo']
    ordering = ['nombre_completo']

    def get_queryset(self):
        return PEP.objects.all()

    @action(detail=False, methods=['post'])
    def verificar(self, request):
        """Verifica si un nombre tiene coincidencia en la lista PEP."""
        nombre = request.data.get('nombre', '')
        if not nombre:
            return Response({'detail': 'Se requiere el campo nombre.'}, status=status.HTTP_400_BAD_REQUEST)

        coincidencias = []
        for pep in PEP.objects.filter(activo=True):
            if pep.nombre_completo.lower() in nombre.lower() or nombre.lower() in pep.nombre_completo.lower():
                coincidencias.append(PEPSerializer(pep).data)
            elif _similitud_nombre(nombre, pep.nombre_completo) >= 0.6:
                coincidencias.append(PEPSerializer(pep).data)

        return Response({
            'nombre_buscado': nombre,
            'total_coincidencias': len(coincidencias),
            'es_pep': len(coincidencias) > 0,
            'coincidencias': coincidencias,
        })

    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser], permission_classes=[IsAuthenticated, IsAdmin])
    def carga_masiva(self, request):
        """Carga masiva de PEPs desde un archivo CSV (nombre,cargo,pais,entidad,fuente)."""
        archivo = request.FILES.get('archivo')
        if not archivo:
            return Response({'detail': 'Se requiere un archivo CSV.'}, status=status.HTTP_400_BAD_REQUEST)

        content = archivo.read().decode('utf-8')
        reader = csv.DictReader(io.StringIO(content))
        creados = 0
        errores = []

        for i, row in enumerate(reader, start=2):
            try:
                PEP.objects.get_or_create(
                    nombre_completo=row.get('nombre', '').strip(),
                    defaults={
                        'cargo': row.get('cargo', '').strip(),
                        'pais': row.get('pais', '').strip(),
                        'entidad': row.get('entidad', '').strip(),
                        'fuente': row.get('fuente', '').strip(),
                    }
                )
                creados += 1
            except Exception as e:
                errores.append(f'Fila {i}: {str(e)}')

        return Response({'creados': creados, 'errores': errores})


class ListaRestrictivaViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsAnalista]
    serializer_class = ListaRestrictivaSerializer
    search_fields = ['nombre', 'pais', 'fundamento_legal']
    filterset_fields = ['tipo', 'activo']
    ordering = ['nombre']

    def get_queryset(self):
        return ListaRestrictiva.objects.all()

    @action(detail=False, methods=['post'])
    def verificar(self, request):
        """Verifica si un nombre aparece en listas restrictivas."""
        nombre = request.data.get('nombre', '')
        if not nombre:
            return Response({'detail': 'Se requiere el campo nombre.'}, status=status.HTTP_400_BAD_REQUEST)

        coincidencias = ListaRestrictiva.objects.filter(
            Q(nombre__icontains=nombre) | Q(nombre__icontains=nombre.split()[0]),
            activo=True
        )

        data = ListaRestrictivaSerializer(coincidencias, many=True).data
        return Response({
            'nombre_buscado': nombre,
            'total_coincidencias': coincidencias.count(),
            'en_lista_restrictiva': coincidencias.exists(),
            'coincidencias': data,
        })
