from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from django.core.validators import validate_comma_separated_integer_list
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.generic import base

from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.permissions import IsAuthenticated

from .serializers import FileUploadSerializer, FileRemoveSerializer

import sys
import os
sys.path.append('./file_storage')

import json

from file_storage import FileStorage

class FileUploadView(APIView):
    permission_classes = (IsAuthenticated,)

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
                file_storage.upload_file_with_path_in_specific_folder(file_path, request.user.email + "@" + "data")

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

class FileSyncDataView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        try:
            serializer = FileUploadSerializer(data = request.data)
            if serializer.is_valid():
                file_name = request.data['name']

                file_storage = FileStorage()
                files = file_storage.get_file_list_in_specific_folder(request.user.email)
                map_file_name = "map.json"

                map_file = ""
                for f in files:
                    if f['title'] == map_file_name:
                        map_file = f
                        break

                if map_file == "": 
                    return JsonResponse({
                        'message': "Internal server error"
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                map_file = json.loads(file_storage.get_content_file(map_file))

                file_data = request.data['data']['data']
                file_data = bytes(bytearray(file_data))
                file_data = json.loads(file_data)

                if int(map_file['last_submission']) == int(file_data['last_submission']):
                    return JsonResponse({
                        'message': "there is nothing to sync",
                        'code': 0
                    }, status=status.HTTP_200_OK)

                files_1 = map_file['files']
                files_2 = file_data['files']

                file_add = list(set(files_2.keys()) - set(files_1.keys()))
                file_modified = []
                file_delete = list(set(files_1.keys()) - set(files_2.keys()))

                intersec_files =  list(set(files_2.keys()) & set(files_1.keys()))

                for file_id in intersec_files:
                    if files_2[file_id]['check_sum'] != files_1[file_id]['check_sum']:
                        file_modified.append(file_id)

                print(file_add)        
                print(file_modified)
                print(file_delete)

                if int(map_file['last_submission']) < int(file_data['last_submission']):
                    # sync to server
                    
                    return JsonResponse({
                        'message': "Sync data to server",
                        'data': {
                            'upload': file_add,
                            'update': file_modified,
                            'remove': file_delete
                        },
                        'code': 1
                    }, status=status.HTTP_200_OK)

                elif int(map_file['last_submission']) < int(file_data['last_submission']):
                    #sync to client
                    
                    return JsonResponse({
                        'message': "Sync data to client",
                        'data': {
                            'upload': file_add,
                            'update': file_modified,
                            'remove': file_delete
                        },
                        'code': 2
                    }, status=status.HTTP_200_OK)



            return JsonResponse({
                'message': "Request's data is wrong"
            }, status=status.HTTP_200_OK)
        except:
            JsonResponse({
            'error_message': "Somethings Error",
            'errors_code': 400,
        }, status=status.HTTP_400_BAD_REQUEST)

class FileRemoveView(APIView):
    permission_classes = (IsAuthenticated,)

    def delete(self, request, *args, **kwargs):
        try:
            serializer = FileRemoveSerializer(data = request.data)
            if serializer.is_valid():
                file_name = request.data['name']

                file_storage = FileStorage()
                files = file_storage.get_file_list_in_specific_folder(request.user.email + "@" + "data")

                remove_file = ""

                for f in files:
                    if f['title'] == file_name:
                        remove_file=  f
                        break

                if remove_file != "":
                    file_storage.delete_file_by_id(f['id'])
                    
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

class TestView(APIView):
    def post(self, request):
        print(request.data['data'].__dir__())
        # serializer = FileUploadSerializer(data = request.data)
        # if serializer.is_valid():
        return JsonResponse({
            'message': 123
        }, status=status.HTTP_200_OK)