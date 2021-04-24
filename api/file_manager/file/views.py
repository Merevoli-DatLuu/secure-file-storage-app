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

from .serializers import FileUploadSerializer

import sys
import os
sys.path.append('./file_storage')

import json

from file_storage import FileStorage

class FileUploadView(APIView):
    def post(self, request):
        base_dir = ".temp/"
        try:
            
            serializer = FileUploadSerializer(data = request.data)
            if serializer.is_valid():
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

            return JsonResponse({
                        'message': "Request's data is wrong"
                    }, status=status.HTTP_400_BAD_REQUEST)
        except:
            JsonResponse({
            'error_message': "Somethings Error",
            'errors_code': 400,
        }, status=status.HTTP_400_BAD_REQUEST)

# api/file/<file:id>
class FileDownloadView(APIView):

    def get(self, request, *args, **kwargs):
        base_dir = ".temp/"
        file_id = kwargs['file_id']
        file_id = '0'*(6-len(str(file_id))) + str(file_id)

        file_storage = FileStorage()

        files = file_storage.get_files_by_title("map.json")
        if len(files) == 0:
            return JsonResponse({
                'message': "Service unavaible"
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        map_json_content = json.loads(file_storage.get_content_file(files[0]))

        if file_id not in map_json_content['files']:
            return JsonResponse({
                'message': "File is not found"
            }, status=status.HTTP_400_BAD_REQUEST)

        file_name = map_json_content['files'][file_id]['name']
        file_name = file_id + file_name + '.aes'

        files = file_storage.get_files_by_title(file_name)
        if len(files) == 0:
            return JsonResponse({
                'message': "Service unavaible"
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        file_storage.download_file(files[0], base_dir + file_name)

        f = open(base_dir + file_name, 'rb')
        data = f.read()
        f.close()

        return JsonResponse({
            'message': {
                'type': 'Buffer',
                'data': list(bytearray(data))

            }
        }, status=status.HTTP_200_OK)



class TestView(APIView):
    def post(self, request):
        print(request.data)
        serializer = FileUploadSerializer(data = request.data)
        if serializer.is_valid():
            return JsonResponse({
                'message': request.data
            }, status=status.HTTP_200_OK)
    
        return JsonResponse({
            'error_message': serializer.errors,
            'errors_code': 400,
        }, status=status.HTTP_400_BAD_REQUEST)