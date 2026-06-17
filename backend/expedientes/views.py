import uuid
from django.db.models import Q
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Expediente
from .serializers import (
    ExpedienteSerializer, ExpedienteDetalleSerializer, AsignarAnalistaSerializer
)
from accounts.models import User
from accounts.permissions import IsAnalista, IsAdminOrOficial


class ExpedienteViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsAnalista]
    filterset_fields = ['estado', 'nivel_riesgo', 'analista']
    search_fields = ['codigo', 'cliente__nombre_completo', 'cliente__numero_documento']
    ordering_fields = ['fecha_apertura', 'nivel_riesgo', 'estado']
    ordering = ['-fecha_apertura']

    def get_queryset(self):
        user = self.request.user
        qs = Expediente.objects.select_related('cliente', 'analista').all()
        if user.rol == 'cliente':
            qs = qs.filter(cliente__email=user.email)
        fecha_desde = self.request.query_params.get('fecha_desde')
        fecha_hasta = self.request.query_params.get('fecha_hasta')
        if fecha_desde:
            qs = qs.filter(fecha_apertura__date__gte=fecha_desde)
        if fecha_hasta:
            qs = qs.filter(fecha_apertura__date__lte=fecha_hasta)
        return qs

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ExpedienteDetalleSerializer
        return ExpedienteSerializer

    def perform_create(self, serializer):
        codigo = f"EXP-{uuid.uuid4().hex[:8].upper()}"
        serializer.save(codigo=codigo)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminOrOficial])
    def asignar_analista(self, request, pk=None):
        expediente = self.get_object()
        serializer = AsignarAnalistaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        analista = User.objects.get(pk=serializer.validated_data['analista_id'])
        expediente.analista = analista
        if expediente.estado == 'borrador':
            expediente.estado = 'pendiente'
        expediente.save()
        return Response(ExpedienteSerializer(expediente).data)

    @action(detail=True, methods=['get'])
    def historial(self, request, pk=None):
        expediente = self.get_object()
        history = expediente.history.all().values(
            'history_date', 'history_user__username', 'history_type',
            'estado', 'nivel_riesgo', 'analista__username'
        )
        return Response(list(history))

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminOrOficial])
    def cambiar_estado(self, request, pk=None):
        expediente = self.get_object()
        nuevo_estado = request.data.get('estado')
        motivo = request.data.get('motivo', '')

        estados_validos = [e[0] for e in Expediente.ESTADOS]
        if nuevo_estado not in estados_validos:
            return Response({'detail': 'Estado inválido.'}, status=status.HTTP_400_BAD_REQUEST)

        expediente.estado = nuevo_estado
        if nuevo_estado == 'rechazado':
            expediente.motivo_rechazo = motivo
        expediente.save()
        return Response(ExpedienteSerializer(expediente).data)
