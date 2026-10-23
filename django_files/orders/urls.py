from django.urls import path
from .views import (
    CreateOrderView, MyOrdersView, OrderDetailView,
    AllOrdersView, UpdateOrderStatusView,
)

urlpatterns = [
    path('',              CreateOrderView.as_view()),       # POST
    path('my/',           MyOrdersView.as_view()),          # GET
    path('<int:pk>/',     OrderDetailView.as_view()),       # GET
    path('all/',          AllOrdersView.as_view()),         # GET admin
    path('<int:pk>/status/', UpdateOrderStatusView.as_view()),  # PATCH admin
]
