from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExpedienteViewSet

router = DefaultRouter()
router.register(r'', ExpedienteViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
