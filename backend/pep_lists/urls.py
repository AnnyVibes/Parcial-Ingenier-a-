from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PEPViewSet, ListaRestrictivaViewSet

router = DefaultRouter()
router.register(r'pep', PEPViewSet, basename='pep')
router.register(r'listas-restrictivas', ListaRestrictivaViewSet, basename='lista-restrictiva')

urlpatterns = [
    path('', include(router.urls)),
]
