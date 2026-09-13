import random
import string
from django.core.mail import send_mail
from django.conf import settings
from .models import OTP


def generate_otp(length=6):
    """Generate a random numeric OTP."""
    return ''.join(random.choices(string.digits, k=length))


def send_otp_email(user, purpose):
    """
    Invalidate old OTPs for this user+purpose, generate a new one,
    save it, then email it.
    """
    # Invalidate any previous unused OTPs for same purpose
    OTP.objects.filter(user=user, purpose=purpose, is_used=False).update(is_used=True)

    code = generate_otp()
    OTP.objects.create(user=user, code=code, purpose=purpose)

    subject_map = {
        'register': 'Fernwood & Co. – Verify your email',
        'login': 'Fernwood & Co. – Your login OTP',
        'reset': 'Fernwood & Co. – Password reset code',
    }
    body_map = {
        'register': (
            f"Hi {user.first_name or user.username},\n\n"
            f"Your verification code is:\n\n"
            f"  {code}\n\n"
            f"This code expires in {getattr(settings, 'OTP_EXPIRY_MINUTES', 10)} minutes.\n"
            f"If you didn't create an account, ignore this email.\n\n"
            f"— Fernwood & Co."
        ),
        'login': (
            f"Hi {user.first_name or user.username},\n\n"
            f"Your login OTP is:\n\n"
            f"  {code}\n\n"
            f"This code expires in {getattr(settings, 'OTP_EXPIRY_MINUTES', 10)} minutes.\n"
            f"If this wasn't you, please secure your account.\n\n"
            f"— Fernwood & Co."
        ),
        'reset': (
            f"Hi {user.first_name or user.username},\n\n"
            f"Your password reset code is:\n\n"
            f"  {code}\n\n"
            f"This code expires in {getattr(settings, 'OTP_EXPIRY_MINUTES', 10)} minutes.\n"
            f"If you didn't request this, ignore this email.\n\n"
            f"— Fernwood & Co."
        ),
    }

    send_mail(
        subject=subject_map[purpose],
        message=body_map[purpose],
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )

    return code
