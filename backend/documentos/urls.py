from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentoViewSet

router = DefaultRouter()
router.register(r'', DocumentoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
