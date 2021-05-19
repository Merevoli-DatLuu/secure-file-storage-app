from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.permissions import IsAuthenticated

from .models import User, UserHistory
from .serializers import UserRegisterSerializer, UserLoginSerializer, UserSerializer, UserChangePasswordSerializer

import sys
sys.path.append('./file_storage')

from file_storage import FileStorage
from datetime import datetime
import requests
import json
import os

class UserRegisterView(APIView):
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            #serializer.validated_data['password'] = make_password(serializer.validated_data['password'])
            serializer.save()

            # create personal folder
            email_info = serializer.validated_data['email']
            file_storage = FileStorage()
            file_storage.create_folder(email_info)
            file_storage.create_folder_in_specific_folder(email_info + "@" + "data", email_info)

            data_map = {
                "folders": {
                    "000000": {
                        "name": "/",
                        "parent": "",
                        "create_date": "17/03/2020"
                    }
                },
                "files": {},
                "last_submission": str(int(datetime.timestamp(datetime.now()) * 1000))
            }

            base_dir = ".temp/" 
            try:
                os.mkdir(os.path.join(base_dir, email_info))
            except:
                print("folder exists") 
            file_path = base_dir + email_info + "/map.json"
            map_file = open(file_path, 'w')
            json.dump(data_map, map_file)
            map_file.close()
                
            file_storage.upload_file_with_path_in_specific_folder(file_path, email_info)

            requests.post('http://127.0.0.1:5000/api/gen_key', data={
                "email": serializer.validated_data['email'],
                "secret_password": "file_manager_kdc"
            })

            return JsonResponse({
                'message': 'Register successful!',
                'data_map': data_map
            }, status=status.HTTP_201_CREATED)

        return JsonResponse({
            'error_messages': serializer.errors,
            'errors_code': 400,
        }, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(APIView):
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = authenticate(
                request,
                username=serializer.validated_data['email'],
                password=serializer.validated_data['password']
            )
            print(user)
            print(serializer.validated_data['email'], serializer.validated_data['password'])
            if user:
                refresh = TokenObtainPairSerializer.get_token(user)
                data = {
                    'refresh_token': str(refresh),
                    'access_token': str(refresh.access_token)
                }

                device_info = ""
                if 'device_info' not in serializer.validated_data:
                    device_info = "Unknown"
                else:
                    device_info = serializer.validated_data['device_info']
                ip = get_client_ip(request)

                user_history = UserHistory(
                    email = serializer.validated_data['email'], 
                    device_info = device_info, 
                    ip = str(ip)
                )
                print(user_history)
                user_history.save()

                return Response(data, status=status.HTTP_200_OK)

            return Response({
                'error_messages': 'Email or password is incorrect!',
                'error_code': 400
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'error_messages': serializer.errors,
            'error_code': 400
        }, status=status.HTTP_400_BAD_REQUEST)

class UserChangePasswordView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = UserChangePasswordSerializer(data=request.data)
        if serializer.is_valid():

            if request.user.check_password(serializer.validated_data['old_password']):
                request.user.set_password(serializer.validated_data['password'])
                request.user.save()

                return JsonResponse({
                    'messages': 'Change password successful!'
                }, status=status.HTTP_201_CREATED)
            else:
                return JsonResponse({
                    'error_messages': {
                        'old_password': ["old password is not correct"]
                    },
                    'errors_code': 400,
                }, status=status.HTTP_400_BAD_REQUEST)

        return JsonResponse({
            'error_messages': serializer.errors,
            'errors_code': 400,
        }, status=status.HTTP_400_BAD_REQUEST)

# @method_decorator(csrf_exempt, name='dispatch')
class UserView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        data = {
            'email': request.user.email,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name
        }
        return Response(data)

class UserHistoryView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        email = request.user.email
        
        data = []
        for user_history in UserHistory.objects.all().filter(email = email):
            data.append({
                'device_info': user_history.device_info,
                'ip': user_history.ip,
                'login_time': user_history.login_time
            })
        return Response(data)

class CheckConnection(APIView):
    def get(self, request):
        return Response("", status=status.HTTP_200_OK)

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip