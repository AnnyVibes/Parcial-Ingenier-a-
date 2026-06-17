from django.contrib.auth import authenticate
from django.utils.decorators import method_decorator
from django.views.decorators.debug import sensitive_post_parameters
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from django_otp.plugins.otp_totp.models import TOTPDevice
import qrcode
import qrcode.image.svg
import io
import base64

from .models import User
from .serializers import (
    UserSerializer, RegisterSerializer,
    ChangePasswordSerializer, MFAVerifySerializer
)
from .permissions import IsAdmin


class LoginRateThrottle(AnonRateThrottle):
    rate = '5/min'


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    search_fields = ['username', 'email']
    filterset_fields = ['rol', 'is_active']

    def get_permissions(self):
        if self.action == 'me':
            return [IsAuthenticated()]
        return super().get_permissions()

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        return Response(UserSerializer(request.user).data)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    @method_decorator(sensitive_post_parameters('password', 'password2'))
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)


class LoginView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    throttle_classes = [LoginRateThrottle]

    @method_decorator(sensitive_post_parameters('password'))
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(request, username=username, password=password)
        if not user:
            return Response({'detail': 'Credenciales inválidas.'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active:
            return Response({'detail': 'Cuenta desactivada.'}, status=status.HTTP_403_FORBIDDEN)

        if user.two_factor_enabled:
            devices = TOTPDevice.objects.filter(user=user, confirmed=True)
            if devices.exists():
                return Response({
                    'mfa_required': True,
                    'detail': 'Se requiere código de verificación.',
                    'user_id': user.id,
                }, status=status.HTTP_200_OK)

        refresh = RefreshToken.for_user(user)
        refresh['rol'] = user.rol

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        })


class MFAVerifyView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = MFAVerifySerializer

    def post(self, request):
        user_id = request.data.get('user_id')
        token = request.data.get('token')

        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'detail': 'Usuario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        device = TOTPDevice.objects.filter(user=user, confirmed=True).first()
        if not device or not device.verify_token(token):
            return Response({'detail': 'Código inválido o expirado.'}, status=status.HTTP_400_BAD_REQUEST)

        refresh = RefreshToken.for_user(user)
        refresh['rol'] = user.rol

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        })


class MFASetupView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        device, created = TOTPDevice.objects.get_or_create(
            user=request.user, name='default', defaults={'confirmed': False}
        )
        config_url = device.config_url
        img = qrcode.make(config_url)
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        qr_b64 = base64.b64encode(buffer.getvalue()).decode()

        return Response({
            'otpauth_url': config_url,
            'qr_code': f'data:image/png;base64,{qr_b64}',
        })

    def post(self, request):
        token = request.data.get('token')
        device = TOTPDevice.objects.filter(user=request.user, name='default').first()
        if not device:
            return Response({'detail': 'Primero obtenga el QR con GET.'}, status=status.HTTP_400_BAD_REQUEST)
        if device.verify_token(token):
            device.confirmed = True
            device.save()
            request.user.two_factor_enabled = True
            request.user.save(update_fields=['two_factor_enabled'])
            return Response({'detail': 'MFA activado correctamente.'})
        return Response({'detail': 'Código inválido.'}, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'detail': 'Contraseña actualizada correctamente.'})
