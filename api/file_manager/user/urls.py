from django.urls import path

from .views import UserRegisterView, UserLoginView, UserView, UserHistoryView, CheckConnection

urlpatterns = [
    path('register', UserRegisterView.as_view(), name='register'),
    path('login', UserLoginView.as_view(), name='login'),
    path('user', UserView.as_view(), name='user'),
    path('login_history', UserHistoryView.as_view(), name='login_history'),
    path('check_connection', CheckConnection.as_view(), name='check_connection'),
]