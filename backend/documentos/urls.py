from django.urls import path, include
from django.core.signing import TimestampSigner, BadSignature, SignatureExpired
from django.http import FileResponse, Http404
from rest_framework.routers import DefaultRouter
from .views import DocumentoViewSet, EXPIRACION_ENLACE_SEGUNDOS
from .models import Documento

router = DefaultRouter()
router.register(r'', DocumentoViewSet, basename='documento')


def descarga_temporal(request, token):
    signer = TimestampSigner()
    try:
        doc_id = signer.unsign(token, max_age=EXPIRACION_ENLACE_SEGUNDOS)
        doc = Documento.objects.get(pk=doc_id)
        return FileResponse(doc.archivo.open('rb'), as_attachment=True, filename=doc.nombre_original or 'documento')
    except (BadSignature, SignatureExpired, Documento.DoesNotExist):
        raise Http404('Enlace inválido o expirado.')


urlpatterns = [
    path('descargar/<str:token>/', descarga_temporal, name='descarga_temporal'),
    path('', include(router.urls)),
]
