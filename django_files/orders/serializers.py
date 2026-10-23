from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product_id', 'name', 'price', 'quantity', 'image', 'subtotal']

    def get_subtotal(self, obj):
        return float(obj.get_subtotal())


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'status', 'customer_name', 'customer_email',
            'full_name', 'email', 'phone', 'address', 'city', 'postal_code',
            'subtotal', 'shipping_fee', 'total', 'notes',
            'items', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_customer_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_customer_email(self, obj):
        return obj.user.email


class CreateOrderSerializer(serializers.Serializer):
    full_name   = serializers.CharField(max_length=200)
    email       = serializers.EmailField()
    phone       = serializers.CharField(max_length=30)
    address     = serializers.CharField()
    city        = serializers.CharField(max_length=100)
    postal_code = serializers.CharField(max_length=20)
    notes       = serializers.CharField(required=False, allow_blank=True, default='')
    items = serializers.ListField(
        child=serializers.DictField(),
        min_length=1,
    )

    def validate_items(self, value):
        for item in value:
            if not all(k in item for k in ['id', 'name', 'price', 'quantity']):
                raise serializers.ValidationError("Each item needs id, name, price, quantity.")
        return value


class UpdateOrderStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[
        'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
    ])
