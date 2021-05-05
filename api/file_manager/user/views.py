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
from .serializers import UserRegisterSerializer, UserLoginSerializer, UserSerializer

import sys
sys.path.append('./file_storage')

from file_storage import FileStorage

class UserRegisterView(APIView):
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            #serializer.validated_data['password'] = make_password(serializer.validated_data['password'])
            serializer.save()

            # create personal folder
            file_storage = FileStorage()
            file_storage.create_folder(serializer.validated_data['email'])

            return JsonResponse({
                'message': 'Register successful!'
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