from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PEPViewSet

router = DefaultRouter()
router.register(r'', PEPViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
