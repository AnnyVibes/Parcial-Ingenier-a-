from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # API MVP: contrato que consume el frontend (tiene prioridad).
    path('api/', include('mvp.urls')),

    # Auth original (registro, mfa setup, change-password) que el MVP no reemplaza.
    path('api/accounts/', include('accounts.urls')),

    # Apps legacy (ModelViewSets originales) bajo prefijo separado.
    path('api/legacy/clients/', include('clients.urls')),
    path('api/legacy/expedientes/', include('expedientes.urls')),
    path('api/legacy/aml-kyc/', include('aml_kyc.urls')),
    path('api/legacy/pep-lists/', include('pep_lists.urls')),
    path('api/legacy/workflow/', include('workflow.urls')),
    path('api/legacy/auditoria/', include('auditoria.urls')),
    path('api/legacy/documentos/', include('documentos.urls')),
    path('api/legacy/dashboard/', include('dashboard.urls')),
]
