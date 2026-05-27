from rest_framework import viewsets
from .models import Cliente
from .serializers import ClienteSerializer


class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    search_fields = ['nombre_completo', 'numero_documento', 'email']
    filterset_fields = ['tipo_documento', 'nacionalidad']
