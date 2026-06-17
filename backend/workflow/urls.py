from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkflowViewSet, EjecutarTransicionView, TransicionesDisponiblesView

router = DefaultRouter()
router.register(r'movimientos', WorkflowViewSet, basename='workflow')

urlpatterns = [
    path('', include(router.urls)),
    path('transicion/', EjecutarTransicionView.as_view(), name='workflow_transicion'),
    path('transiciones/<int:expediente_id>/', TransicionesDisponiblesView.as_view(), name='transiciones_disponibles'),
]
