from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/accounts/', include('accounts.urls')),
    path('api/clients/', include('clients.urls')),
    path('api/expedientes/', include('expedientes.urls')),
    path('api/aml-kyc/', include('aml_kyc.urls')),
    path('api/pep-lists/', include('pep_lists.urls')),
    path('api/workflow/', include('workflow.urls')),
    path('api/auditoria/', include('auditoria.urls')),
    path('api/documentos/', include('documentos.urls')),
    path('api/alertas/', include('alertas.urls')),
    path('api/dashboard/', include('dashboard.urls')),
]
