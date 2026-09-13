from django.urls import path
from .views import (
    RegisterView,
    VerifyOTPView,
    LoginView,
    ResendOTPView,
    ForgotPasswordView,
    ResetPasswordView,
    LogoutView,
    MeView,
)

urlpatterns = [
    path('register/',        RegisterView.as_view(),       name='auth-register'),
    path('verify-otp/',      VerifyOTPView.as_view(),       name='auth-verify-otp'),
    path('login/',           LoginView.as_view(),           name='auth-login'),
    path('resend-otp/',      ResendOTPView.as_view(),       name='auth-resend-otp'),
    path('forgot-password/', ForgotPasswordView.as_view(),  name='auth-forgot-password'),
    path('reset-password/',  ResetPasswordView.as_view(),   name='auth-reset-password'),
    path('logout/',          LogoutView.as_view(),          name='auth-logout'),
    path('me/',              MeView.as_view(),              name='auth-me'),
]
