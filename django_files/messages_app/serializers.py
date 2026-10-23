from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Message


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    sender_email = serializers.SerializerMethodField()
    recipient_email = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_name', 'sender_email',
                  'recipient', 'recipient_email', 'subject', 'body',
                  'is_read', 'created_at']
        read_only_fields = ['sender', 'created_at']

    def get_sender_name(self, obj):
        return obj.sender.get_full_name() or obj.sender.username

    def get_sender_email(self, obj):
        return obj.sender.email

    def get_recipient_email(self, obj):
        return obj.recipient.email if obj.recipient else 'Admin'


class SendMessageSerializer(serializers.Serializer):
    subject = serializers.CharField(max_length=200)
    body = serializers.TextField if False else serializers.CharField(style={'base_template': 'textarea.html'})
    recipient_id = serializers.IntegerField(required=False, allow_null=True)
