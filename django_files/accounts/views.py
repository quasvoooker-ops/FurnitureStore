from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated

from .models import OTP, UserProfile
from .serializers import (
    RegisterSerializer, VerifyOTPSerializer, LoginSerializer,
    ResendOTPSerializer, ForgotPasswordSerializer,
    ResetPasswordSerializer, UserProfileSerializer,
)
from .utils import send_otp_email


class RegisterView(APIView):
    """
    POST /api/auth/register/
    Creates an inactive user and sends a registration OTP.
    """
    permission_classes = []

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        names = data['full_name'].split(' ', 1)
        first = names[0]
        last = names[1] if len(names) > 1 else ''

        user = User.objects.create_user(
            username=data['email'],
            email=data['email'],
            password=data['password'],
            first_name=first,
            last_name=last,
            is_active=False,   # inactive until OTP verified
        )
        UserProfile.objects.create(user=user, role='customer', is_verified=False)

        send_otp_email(user, 'register')

        return Response(
            {'detail': 'Account created. Check your email for the verification code.'},
            status=status.HTTP_201_CREATED,
        )


class VerifyOTPView(APIView):
    """
    POST /api/auth/verify-otp/
    Verifies OTP for register / login / reset purposes.
    - register: activates account, returns token
    - login: returns token
    - reset: returns a short-lived reset_token (used by ResetPasswordView)
    """
    permission_classes = []

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email'].lower()
        code = serializer.validated_data['code']
        purpose = serializer.validated_data['purpose']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        otp = (
            OTP.objects
            .filter(user=user, code=code, purpose=purpose, is_used=False)
            .order_by('-created_at')
            .first()
        )

        if not otp:
            return Response({'detail': 'Invalid OTP code.'}, status=status.HTTP_400_BAD_REQUEST)

        if otp.is_expired():
            return Response({'detail': 'OTP has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

        # Mark OTP as used
        otp.is_used = True
        otp.save()

        if purpose == 'register':
            user.is_active = True
            user.save()
            profile = user.profile
            profile.is_verified = True
            profile.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'detail': 'Email verified. Account activated.',
                'token': token.key,
                'role': profile.role,
                'full_name': user.get_full_name(),
                'email': user.email,
            })

        elif purpose == 'login':
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'detail': 'OTP verified.',
                'token': token.key,
                'role': user.profile.role,
                'full_name': user.get_full_name(),
                'email': user.email,
            })

        elif purpose == 'reset':
            # Return a temporary token scoped to password reset
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'detail': 'OTP verified. You may now reset your password.',
                'reset_token': token.key,
            })


class LoginView(APIView):
    """
    POST /api/auth/login/
    Validates credentials, sends login OTP.
    """
    permission_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email'].lower()
        password = serializer.validated_data['password']

        user = authenticate(request, username=email, password=password)
        if not user:
            return Response({'detail': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active:
            return Response(
                {'detail': 'Account not verified. Please complete email verification first.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        send_otp_email(user, 'login')

        return Response({'detail': 'OTP sent to your email. Please verify to continue.'})


class ResendOTPView(APIView):
    """
    POST /api/auth/resend-otp/
    Resends OTP for any purpose.
    """
    permission_classes = []

    def post(self, request):
        serializer = ResendOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email'].lower()
        purpose = serializer.validated_data['purpose']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        send_otp_email(user, purpose)
        return Response({'detail': 'A new OTP has been sent to your email.'})


class ForgotPasswordView(APIView):
    """
    POST /api/auth/forgot-password/
    Sends a password-reset OTP.
    """
    permission_classes = []

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email'].lower()
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Don't reveal whether email exists
            return Response({'detail': 'If that email exists, a reset code has been sent.'})

        send_otp_email(user, 'reset')
        return Response({'detail': 'If that email exists, a reset code has been sent.'})


class ResetPasswordView(APIView):
    """
    POST /api/auth/reset-password/
    Verifies reset OTP and sets new password.
    """
    permission_classes = []

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email'].lower()
        code = serializer.validated_data['code']
        new_password = serializer.validated_data['new_password']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        otp = (
            OTP.objects
            .filter(user=user, code=code, purpose='reset', is_used=False)
            .order_by('-created_at')
            .first()
        )

        if not otp:
            return Response({'detail': 'Invalid OTP code.'}, status=status.HTTP_400_BAD_REQUEST)

        if otp.is_expired():
            return Response({'detail': 'OTP has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

        otp.is_used = True
        otp.save()

        user.set_password(new_password)
        user.save()

        return Response({'detail': 'Password updated successfully.'})


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Deletes the user's auth token.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()
        return Response({'detail': 'Logged out successfully.'})


class MeView(APIView):
    """
    GET /api/auth/me/
    Returns the current authenticated user's info.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user.profile)
        return Response(serializer.data)
