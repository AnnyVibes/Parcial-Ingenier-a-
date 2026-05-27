from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EvaluacionRiesgoViewSet

router = DefaultRouter()
router.register(r'evaluaciones', EvaluacionRiesgoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
