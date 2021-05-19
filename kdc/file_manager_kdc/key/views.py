from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import UserKeyLoginSerializer, UserKeyRegisterSerializer
from  .models import UserKey
import requests
import random

class LoginView(APIView):
    
    def post(self, request):
        serializer = UserKeyLoginSerializer(data = request.data)

        if serializer.is_valid():
            
            # send request to server for validing user
            url = "http://127.0.0.1:8000/api/user"
            headers = {
                "Authorization": f"Bearer {serializer.validated_data['token']}"
            }
            response = requests.get(url, headers=headers)

            if response.status_code == 200:
                response_data = UserKey.objects.filter(email = response.json()['email'])[0].__dict__

                response_data.pop('_state', None)
                return Response(response_data, status=status.HTTP_200_OK)
            else:
                return Response({
                    'message': 'invalid token' 
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({   
                'message': serializer.errors,
            }, status=status.HTTP_400_BAD_REQUEST)

class RegisterView(APIView):

    def post(self, request):
        serializer = UserKeyRegisterSerializer(data = request.data)

        if serializer.is_valid():
            try:
                key_length = 32
                iv_length = 16

                new_key = "{:032x}".format(random.randrange(0, (1 << (key_length*4))))
                new_iv = "{:016x}".format(random.randrange(0, (1 << (iv_length*4))))

                new_userkey = UserKey(
                    email = serializer.validated_data['email'],
                    key = new_key,
                    iv = new_iv
                )
                new_userkey.save()

                return Response({
                    'message': "Create new user-key successful"
                }, status=status.HTTP_201_CREATED)

            except:
                return Response({
                    'message': 'Something is wrong' 
                }, status=status.HTTP_400_BAD_REQUEST)
                
        return Response({
            'message': serializer.errors,
        }, status=status.HTTP_400_BAD_REQUEST)





            

