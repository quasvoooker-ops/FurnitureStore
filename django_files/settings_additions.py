# ─────────────────────────────────────────────
# ADD / REPLACE these in your mysite/settings.py
# ─────────────────────────────────────────────

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',           # NEW – allow Next.js to call Django
    'products',              # existing
    'accounts',              # NEW – auth + OTP app
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',   # NEW – must be FIRST
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Allow Next.js dev server to call Django
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
CORS_ALLOW_CREDENTIALS = True

# ── Real Gmail SMTP (replace with your Gmail + App Password) ──
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your_gmail@gmail.com'       # <-- your Gmail
EMAIL_HOST_PASSWORD = 'your_app_password_here'  # <-- Gmail App Password (not your login password)
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

# OTP expiry in minutes
OTP_EXPIRY_MINUTES = 10

# Django REST Framework – token auth
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
}
