from django.urls import path

from .views import LoginView, RegisterView

urlpatterns = [
    path('get_key', LoginView.as_view()),
    path('gen_key', RegisterView.as_view()),
]