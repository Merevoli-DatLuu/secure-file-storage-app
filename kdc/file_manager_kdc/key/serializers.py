from rest_framework import serializers

class UserKeyLoginSerializer(serializers.Serializer):
    token = serializers.CharField(max_length=400, required=True)

class UserKeyRegisterSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=200, required=True)
    secret_password = serializers.CharField(max_length=100, required=True)

    def validate(self, attrs):
        if attrs['secret_password'] == "file_manager_kdc":
            return attrs
        else:
            raise serializers.ValidationError({"secret_password": "secret_password fields didn't match."})