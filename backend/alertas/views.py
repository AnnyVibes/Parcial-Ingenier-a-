import csv
import io
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Alerta
from .serializers import AlertaSerializer
from accounts.permissions import IsAnalista


class AlertaViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsAnalista]
    serializer_class = AlertaSerializer
    filterset_fields = ['tipo', 'estado', 'nivel_severidad', 'cliente', 'asignado_a']
    ordering_fields = ['fecha_creacion', 'nivel_severidad']
    ordering = ['-fecha_creacion']

    def get_queryset(self):
        qs = Alerta.objects.select_related('cliente', 'asignado_a').all()
        fecha_desde = self.request.query_params.get('fecha_desde')
        fecha_hasta = self.request.query_params.get('fecha_hasta')
        if fecha_desde:
            qs = qs.filter(fecha_creacion__date__gte=fecha_desde)
        if fecha_hasta:
            qs = qs.filter(fecha_creacion__date__lte=fecha_hasta)
        return qs

    @action(detail=True, methods=['post'])
    def resolver(self, request, pk=None):
        alerta = self.get_object()
        alerta.estado = 'resuelta'
        alerta.fecha_resolucion = timezone.now()
        alerta.save(update_fields=['estado', 'fecha_resolucion'])
        return Response(AlertaSerializer(alerta).data)

    @action(detail=True, methods=['post'])
    def falso_positivo(self, request, pk=None):
        alerta = self.get_object()
        alerta.estado = 'falso_positivo'
        alerta.fecha_resolucion = timezone.now()
        alerta.save(update_fields=['estado', 'fecha_resolucion'])
        return Response(AlertaSerializer(alerta).data)

    @action(detail=False, methods=['get'])
    def resumen(self, request):
        """Totales por tipo y severidad para mostrar en el dashboard."""
        qs = Alerta.objects.filter(estado__in=['nueva', 'en_revision'])
        return Response({
            'total_activas': qs.count(),
            'criticas': qs.filter(nivel_severidad='alta').count(),
            'medias': qs.filter(nivel_severidad='media').count(),
            'bajas': qs.filter(nivel_severidad='baja').count(),
            'por_tipo': {
                tipo: qs.filter(tipo=tipo).count()
                for tipo, _ in Alerta.TIPOS
            },
        })

    @action(detail=False, methods=['get'])
    def exportar_csv(self, request):
        qs = self.filter_queryset(self.get_queryset())
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="alertas.csv"'

        writer = csv.writer(response)
        writer.writerow(['Fecha', 'Cliente', 'Tipo', 'Severidad', 'Estado', 'Descripción'])
        for alerta in qs:
            writer.writerow([
                alerta.fecha_creacion.strftime('%Y-%m-%d %H:%M'),
                alerta.cliente.nombre_completo,
                alerta.get_tipo_display(),
                alerta.get_nivel_severidad_display(),
                alerta.get_estado_display(),
                alerta.descripcion,
            ])
        return response
