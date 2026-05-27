from rest_framework import viewsets
from .models import PEP
from .serializers import PEPSerializer


class PEPViewSet(viewsets.ModelViewSet):
    queryset = PEP.objects.all()
    serializer_class = PEPSerializer
    search_fields = ['nombre_completo', 'cargo', 'pais']
    filterset_fields = ['pais', 'activo']
