from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Message
from .serializers import MessageSerializer


class IsAdminUser(IsAuthenticated):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        try:
            return request.user.profile.role == 'admin'
        except Exception:
            return False


class InboxView(APIView):
    """GET /api/messages/inbox/ — returns messages sent TO the current user"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        messages = Message.objects.filter(recipient=request.user)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)


class SentView(APIView):
    """GET /api/messages/sent/ — returns messages sent BY the current user"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        messages = Message.objects.filter(sender=request.user)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)


class SendMessageView(APIView):
    """POST /api/messages/send/ — send a message to admin (or specific user if admin)"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        subject = request.data.get('subject', '').strip()
        body = request.data.get('body', '').strip()
        recipient_id = request.data.get('recipient_id')

        if not subject or not body:
            return Response({'detail': 'Subject and body are required.'}, status=400)

        # If customer sends, recipient is admin
        # If admin sends, recipient is specified user
        if recipient_id:
            try:
                recipient = User.objects.get(id=recipient_id)
            except User.DoesNotExist:
                return Response({'detail': 'Recipient not found.'}, status=404)
        else:
            # Find first admin user
            try:
                from accounts.models import UserProfile
                admin_profile = UserProfile.objects.filter(role='admin').first()
                recipient = admin_profile.user if admin_profile else None
            except Exception:
                recipient = None

        message = Message.objects.create(
            sender=request.user,
            recipient=recipient,
            subject=subject,
            body=body,
        )
        return Response(MessageSerializer(message).data, status=201)


class MarkReadView(APIView):
    """PATCH /api/messages/<id>/read/ — mark a message as read"""
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            message = Message.objects.get(id=pk, recipient=request.user)
        except Message.DoesNotExist:
            return Response({'detail': 'Message not found.'}, status=404)
        message.is_read = True
        message.save()
        return Response({'detail': 'Marked as read.'})


class AllMessagesView(APIView):
    """GET /api/messages/all/ — admin only, see all messages"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        messages = Message.objects.all()
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)


class UserListView(APIView):
    """GET /api/messages/users/ — admin only, list users to reply to"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        from accounts.models import UserProfile
        profiles = UserProfile.objects.filter(role='customer').select_related('user')
        data = [{'id': p.user.id, 'name': p.user.get_full_name() or p.user.username, 'email': p.user.email} for p in profiles]
        return Response(data)
