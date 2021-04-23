from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.generic import base

from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

    
import sys
import os
sys.path.append('./file_storage')


from file_storage import FileStorage

class FileUploadView(APIView):
    def post(self, request):
        base_dir = ".temp/"
        try:
            if 'name' not in request.data or 'data' not in request.data or type(request.data['data']) != type(dict()) or 'data' not in request.data['data']:
                return JsonResponse({
                    'message': "Request's data is wrong"
                }, status=status.HTTP_400_BAD_REQUEST)

            file_name = request.data['name']
            file_data = request.data['data']['data']
            file_path = base_dir + file_name
            file = open(file_path, 'wb')
            file.write(bytes(bytearray(file_data)))
            file.close()

            file_storage = FileStorage()
            file_storage.upload_file_with_path(file_path)

            if os.path.exists(file_path):
                os.remove(file_path)
                
                return JsonResponse({
                    'message': request.data
                }, status=status.HTTP_200_OK)
            else:
                return JsonResponse({
                    'message': "Service unavaible"
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except:
            JsonResponse({
            'error_message': "Somethings Error",
            'errors_code': 400,
        }, status=status.HTTP_400_BAD_REQUEST)
