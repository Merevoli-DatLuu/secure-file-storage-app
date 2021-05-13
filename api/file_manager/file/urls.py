"""file_manager URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path, include
from .views import *

urlpatterns = [
    path('file', FileUploadView.as_view()),
    path('test', TestView.as_view()),
    path('file/<int:file_id>', FileDownloadView.as_view()),
    path('file/map', FileDownloadMapView.as_view()),
    path('remove_file', FileRemoveView.as_view()),
    path('update_file', FileUpdateView.as_view()),
    path('sync_file', FileSyncDataView.as_view()),
    path('update_file_map', FileUpdateMapView.as_view())
]
