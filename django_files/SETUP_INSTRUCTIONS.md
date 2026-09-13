# Django Setup Instructions

## Step 1 – Install missing packages

Open a terminal in your Django folder (C:\DjangoFurniture\mysite) and run:

```
pip install djangorestframework django-cors-headers
```

## Step 2 – Create the accounts app

In the same terminal:

```
python manage.py startapp accounts
```

## Step 3 – Copy these files into your Django project

| This file                          | Copy to                                          |
|------------------------------------|--------------------------------------------------|
| accounts/models.py                 | C:\DjangoFurniture\mysite\accounts\models.py     |
| accounts/views.py                  | C:\DjangoFurniture\mysite\accounts\views.py      |
| accounts/serializers.py            | C:\DjangoFurniture\mysite\accounts\serializers.py|
| accounts/urls.py                   | C:\DjangoFurniture\mysite\accounts\urls.py       |
| accounts/utils.py                  | C:\DjangoFurniture\mysite\accounts\utils.py      |
| accounts/admin.py                  | C:\DjangoFurniture\mysite\accounts\admin.py      |
| accounts/apps.py                   | C:\DjangoFurniture\mysite\accounts\apps.py       |
| mysite_urls.py                     | C:\DjangoFurniture\mysite\mysite\urls.py         |

## Step 4 – Update settings.py

Open C:\DjangoFurniture\mysite\mysite\settings.py and:

1. REMOVE the MAILERS block entirely
2. Add everything from settings_additions.py
3. Replace EMAIL_HOST_USER with your actual Gmail address
4. Replace EMAIL_HOST_PASSWORD with your Gmail App Password

### How to get a Gmail App Password:
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification if not already on
3. Go to https://myaccount.google.com/apppasswords
4. Select app: Mail, device: Windows Computer
5. Copy the 16-character password — paste it into EMAIL_HOST_PASSWORD

## Step 5 – Run migrations

```
python manage.py makemigrations accounts
python manage.py migrate
```

## Step 6 – Create a superuser (admin)

```
python manage.py createsuperuser
```

## Step 7 – Start the server

```
python manage.py runserver
```

## API Endpoints

| Method | URL                          | What it does                        |
|--------|------------------------------|-------------------------------------|
| POST   | /api/auth/register/          | Register → sends OTP to email       |
| POST   | /api/auth/verify-otp/        | Verify OTP (register/login/reset)   |
| POST   | /api/auth/login/             | Login → sends OTP to email          |
| POST   | /api/auth/resend-otp/        | Resend OTP                          |
| POST   | /api/auth/forgot-password/   | Send password reset OTP             |
| POST   | /api/auth/reset-password/    | Reset password with OTP             |
| POST   | /api/auth/logout/            | Logout (delete token)               |
| GET    | /api/auth/me/                | Get current user info               |
