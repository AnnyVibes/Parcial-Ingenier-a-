from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


class DashboardMetricsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from clients.models import Cliente
        from alertas.models import Alerta
        from expedientes.models import Expediente
        from aml_kyc.models import EvaluacionRiesgo

        data = {
            'total_clientes': Cliente.objects.count(),
            'alertas_pendientes': Alerta.objects.filter(estado='nueva').count(),
            'expedientes_activos': Expediente.objects.exclude(estado='completado').count(),
            'evaluaciones_alto_riesgo': EvaluacionRiesgo.objects.filter(nivel_riesgo__in=['alto', 'critico']).count(),
        }
        return Response(data)


class AlertasPorTipoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from alertas.models import Alerta
        from django.db.models import Count

        data = Alerta.objects.values('tipo').annotate(count=Count('id')).order_by('-count')
        return Response(data)


class RiesgoDistribucionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from aml_kyc.models import EvaluacionRiesgo
        from django.db.models import Count

        data = EvaluacionRiesgo.objects.values('nivel_riesgo').annotate(count=Count('id')).order_by('nivel_riesgo')
        return Response(data)
