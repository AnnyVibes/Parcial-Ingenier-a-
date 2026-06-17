from rest_framework import viewsets, status, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Workflow, TRANSICIONES_VALIDAS, ROLES_POR_TRANSICION
from .serializers import WorkflowSerializer, TransicionSerializer
from accounts.permissions import IsAnalista


class WorkflowViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, IsAnalista]
    serializer_class = WorkflowSerializer
    filterset_fields = ['expediente', 'estado_nuevo']
    ordering = ['-fecha']

    def get_queryset(self):
        return Workflow.objects.select_related('expediente', 'ejecutado_por').all()


class EjecutarTransicionView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TransicionSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        expediente = serializer.validated_data['expediente']
        nuevo_estado = serializer.validated_data['nuevo_estado']
        comentarios = serializer.validated_data.get('comentarios', '')
        estado_actual = expediente.estado

        roles_permitidos = ROLES_POR_TRANSICION.get((estado_actual, nuevo_estado), [])
        if request.user.rol not in roles_permitidos:
            return Response(
                {'detail': f"Tu rol '{request.user.rol}' no puede ejecutar esta transición."},
                status=status.HTTP_403_FORBIDDEN
            )

        movimiento = Workflow.objects.create(
            expediente=expediente,
            estado_anterior=estado_actual,
            estado_nuevo=nuevo_estado,
            ejecutado_por=request.user,
            comentarios=comentarios,
        )

        expediente.estado = nuevo_estado
        expediente.save(update_fields=['estado'])

        return Response(WorkflowSerializer(movimiento).data, status=status.HTTP_201_CREATED)


class TransicionesDisponiblesView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, expediente_id):
        from expedientes.models import Expediente
        try:
            expediente = Expediente.objects.get(pk=expediente_id)
        except Expediente.DoesNotExist:
            return Response({'detail': 'Expediente no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        estado_actual = expediente.estado
        transiciones = TRANSICIONES_VALIDAS.get(estado_actual, [])
        disponibles = [
            t for t in transiciones
            if request.user.rol in ROLES_POR_TRANSICION.get((estado_actual, t), [])
        ]
        return Response({
            'estado_actual': estado_actual,
            'transiciones_disponibles': disponibles,
        })
