from rest_framework import serializers

class FileDataSerializer(serializers.Serializer):
    type = serializers.CharField(required=True)
    data =  serializers.ListField(
        child = serializers.IntegerField(required=True),
    )

class FileUploadSerializer(serializers.Serializer):
    name = serializers.CharField(required = True)
    data = FileDataSerializer(required = True)

class FileRemoveSerializer(serializers.Serializer):
    name = serializers.CharField(required = True)