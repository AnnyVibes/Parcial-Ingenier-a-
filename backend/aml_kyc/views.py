from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import EvaluacionRiesgo
from .serializers import EvaluacionRiesgoSerializer
from .scoring import calcular_score
from expedientes.models import Expediente
from accounts.permissions import IsAnalista


class EvaluacionRiesgoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsAnalista]
    serializer_class = EvaluacionRiesgoSerializer
    filterset_fields = ['nivel_riesgo', 'cliente', 'expediente']
    ordering = ['-fecha_evaluacion']

    def get_queryset(self):
        return EvaluacionRiesgo.objects.select_related('cliente', 'expediente', 'evaluado_por').all()

    def perform_create(self, serializer):
        cliente = serializer.validated_data['cliente']
        expediente = serializer.validated_data['expediente']
        resultado = calcular_score(cliente, expediente)
        evaluacion = serializer.save(
            evaluado_por=self.request.user,
            score=resultado['score'],
            nivel_riesgo=resultado['nivel'],
            resultado_aml=resultado,
        )
        expediente.nivel_riesgo = resultado['nivel']
        expediente.save(update_fields=['nivel_riesgo'])

    @action(detail=False, methods=['post'])
    def evaluar(self, request):
        """Evalúa el riesgo de un expediente sin guardar, solo para previsualizar."""
        expediente_id = request.data.get('expediente_id')
        try:
            expediente = Expediente.objects.select_related('cliente').get(pk=expediente_id)
        except Expediente.DoesNotExist:
            return Response({'detail': 'Expediente no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        resultado = calcular_score(expediente.cliente, expediente)
        return Response(resultado)

    @action(detail=False, methods=['post'])
    def evaluar_y_guardar(self, request):
        """Calcula el riesgo de un expediente y lo registra."""
        expediente_id = request.data.get('expediente_id')
        try:
            expediente = Expediente.objects.select_related('cliente').get(pk=expediente_id)
        except Expediente.DoesNotExist:
            return Response({'detail': 'Expediente no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        resultado = calcular_score(expediente.cliente, expediente)
        evaluacion = EvaluacionRiesgo.objects.create(
            cliente=expediente.cliente,
            expediente=expediente,
            evaluado_por=request.user,
            score=resultado['score'],
            nivel_riesgo=resultado['nivel'],
            resultado_aml=resultado,
        )
        expediente.nivel_riesgo = resultado['nivel']
        expediente.save(update_fields=['nivel_riesgo'])

        return Response(EvaluacionRiesgoSerializer(evaluacion).data, status=status.HTTP_201_CREATED)
