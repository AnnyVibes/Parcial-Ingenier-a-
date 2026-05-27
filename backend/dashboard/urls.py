from django.urls import path
from .views import DashboardMetricsView, AlertasPorTipoView, RiesgoDistribucionView

urlpatterns = [
    path('metrics/', DashboardMetricsView.as_view(), name='dashboard-metrics'),
    path('alertas-por-tipo/', AlertasPorTipoView.as_view(), name='alertas-por-tipo'),
    path('riesgo-distribucion/', RiesgoDistribucionView.as_view(), name='riesgo-distribucion'),
]
