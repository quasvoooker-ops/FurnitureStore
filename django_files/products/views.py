from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product
from .serializers import ProductSerializer


class IsAdminUser(BasePermission):
    """Only allow users with role='admin' in their profile."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        try:
            return request.user.profile.role == 'admin'
        except Exception:
            return False


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'category']
    ordering_fields = ['name', 'price', 'created_at', 'rating']

    def get_permissions(self):
        # Anyone can list/retrieve products
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        # Only admins can create/update/delete
        return [IsAuthenticated(), IsAdminUser()]

    def get_queryset(self):
        qs = Product.objects.all().order_by('-created_at')
        category = self.request.query_params.get('category')
        available = self.request.query_params.get('available')
        if category:
            qs = qs.filter(category=category)
        if available is not None:
            qs = qs.filter(is_available=available.lower() == 'true')
        return qs

    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated, IsAdminUser])
    def toggle_availability(self, request, pk=None):
        product = self.get_object()
        product.is_available = not product.is_available
        product.save()
        return Response({
            'id': product.id,
            'name': product.name,
            'is_available': product.is_available,
        })
