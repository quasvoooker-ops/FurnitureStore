from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Order, OrderItem
from .serializers import OrderSerializer, CreateOrderSerializer, UpdateOrderStatusSerializer


class IsAdminOrStaff(IsAuthenticated):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        try:
            return request.user.profile.role in ('admin', 'staff')
        except Exception:
            return False


class CreateOrderView(APIView):
    """POST /api/orders/ — customer places an order"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        s = CreateOrderSerializer(data=request.data)
        if not s.is_valid():
            return Response(s.errors, status=400)

        d = s.validated_data
        items_data = d.pop('items')

        # Calculate totals
        subtotal = sum(
            float(item['price']) * int(item['quantity'])
            for item in items_data
        )
        shipping_fee = 0 if subtotal >= 5000 else 150
        total = subtotal + shipping_fee

        order = Order.objects.create(
            user=request.user,
            subtotal=subtotal,
            shipping_fee=shipping_fee,
            total=total,
            **d,
        )

        for item in items_data:
            OrderItem.objects.create(
                order=order,
                product_id=item['id'],
                name=item['name'],
                price=float(item['price'].replace('$', '').replace(',', '')) if isinstance(item['price'], str) else float(item['price']),
                quantity=int(item['quantity']),
                image=item.get('image', ''),
            )

        return Response(OrderSerializer(order).data, status=201)


class MyOrdersView(APIView):
    """GET /api/orders/my/ — customer's own orders"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user)
        return Response(OrderSerializer(orders, many=True).data)


class OrderDetailView(APIView):
    """GET /api/orders/<id>/ — single order detail"""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            order = Order.objects.get(id=pk)
        except Order.DoesNotExist:
            return Response({'detail': 'Order not found.'}, status=404)

        # Only owner or admin can view
        if order.user != request.user:
            try:
                if request.user.profile.role not in ('admin', 'staff'):
                    return Response({'detail': 'Not authorized.'}, status=403)
            except Exception:
                return Response({'detail': 'Not authorized.'}, status=403)

        return Response(OrderSerializer(order).data)


class AllOrdersView(APIView):
    """GET /api/orders/all/ — admin sees all orders"""
    permission_classes = [IsAdminOrStaff]

    def get(self, request):
        orders = Order.objects.all()
        return Response(OrderSerializer(orders, many=True).data)


class UpdateOrderStatusView(APIView):
    """PATCH /api/orders/<id>/status/ — admin updates order status"""
    permission_classes = [IsAdminOrStaff]

    def patch(self, request, pk):
        try:
            order = Order.objects.get(id=pk)
        except Order.DoesNotExist:
            return Response({'detail': 'Order not found.'}, status=404)

        s = UpdateOrderStatusSerializer(data=request.data)
        if not s.is_valid():
            return Response(s.errors, status=400)

        order.status = s.validated_data['status']
        order.save()
        return Response(OrderSerializer(order).data)
