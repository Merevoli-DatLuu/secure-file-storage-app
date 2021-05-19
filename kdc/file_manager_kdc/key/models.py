from django.db import models

# Create your models here.
class UserKey(models.Model):
    email = models.EmailField(max_length=100, unique=True)
    key = models.CharField(max_length=32)
    iv = models.CharField(max_length=16)

    
    def __str__(self):
        return self.email