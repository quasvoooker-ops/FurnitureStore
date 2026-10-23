from django.urls import path
from .views import InboxView, SentView, SendMessageView, MarkReadView, AllMessagesView, UserListView

urlpatterns = [
    path('inbox/',      InboxView.as_view()),
    path('sent/',       SentView.as_view()),
    path('send/',       SendMessageView.as_view()),
    path('<int:pk>/read/', MarkReadView.as_view()),
    path('all/',        AllMessagesView.as_view()),
    path('users/',      UserListView.as_view()),
]
