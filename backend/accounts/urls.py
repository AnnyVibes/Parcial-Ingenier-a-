from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    UserViewSet, RegisterView, LoginView,
    MFAVerifyView, MFASetupView, ChangePasswordView
)

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('mfa/setup/', MFASetupView.as_view(), name='mfa_setup'),
    path('mfa/verify/', MFAVerifyView.as_view(), name='mfa_verify'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
]
