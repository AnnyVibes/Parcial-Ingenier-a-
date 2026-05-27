from rest_framework import viewsets
from .models import AuditoriaLog
from .serializers import AuditoriaLogSerializer


class AuditoriaLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditoriaLog.objects.all()
    serializer_class = AuditoriaLogSerializer
    filterset_fields = ['accion', 'usuario', 'modelo']
    ordering = ['-fecha']
