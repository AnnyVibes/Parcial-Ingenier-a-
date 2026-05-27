from rest_framework import viewsets
from .models import EvaluacionRiesgo
from .serializers import EvaluacionRiesgoSerializer


class EvaluacionRiesgoViewSet(viewsets.ModelViewSet):
    queryset = EvaluacionRiesgo.objects.all()
    serializer_class = EvaluacionRiesgoSerializer
    filterset_fields = ['nivel_riesgo', 'cliente']
