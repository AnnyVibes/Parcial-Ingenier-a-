import csv
from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from .models import AuditoriaLog
from .serializers import AuditoriaLogSerializer
from accounts.permissions import IsAuditor


class AuditoriaLogViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, IsAuditor]
    serializer_class = AuditoriaLogSerializer
    filterset_fields = ['accion', 'usuario', 'modelo']
    search_fields = ['modelo', 'objeto_id', 'usuario__username']
    ordering_fields = ['fecha']
    ordering = ['-fecha']

    def get_queryset(self):
        qs = AuditoriaLog.objects.select_related('usuario').all()
        fecha_desde = self.request.query_params.get('fecha_desde')
        fecha_hasta = self.request.query_params.get('fecha_hasta')
        expediente_id = self.request.query_params.get('expediente_id')

        if fecha_desde:
            qs = qs.filter(fecha__date__gte=fecha_desde)
        if fecha_hasta:
            qs = qs.filter(fecha__date__lte=fecha_hasta)
        if expediente_id:
            qs = qs.filter(modelo='Expediente', objeto_id=str(expediente_id))
        return qs

    @action(detail=False, methods=['get'])
    def exportar_csv(self, request):
        qs = self.filter_queryset(self.get_queryset())
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="auditoria.csv"'

        writer = csv.writer(response)
        writer.writerow(['Fecha', 'Usuario', 'Acción', 'Módulo', 'ID Objeto', 'IP'])
        for log in qs:
            writer.writerow([
                log.fecha.strftime('%Y-%m-%d %H:%M:%S'),
                log.usuario.username if log.usuario else '—',
                log.get_accion_display(),
                log.modelo,
                log.objeto_id,
                log.ip_address or '—',
            ])
        return response
