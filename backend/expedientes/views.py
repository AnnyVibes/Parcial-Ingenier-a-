from rest_framework import viewsets
from .models import Expediente
from .serializers import ExpedienteSerializer


class ExpedienteViewSet(viewsets.ModelViewSet):
    queryset = Expediente.objects.all()
    serializer_class = ExpedienteSerializer
    search_fields = ['codigo', 'cliente__nombre_completo']
    filterset_fields = ['estado']
