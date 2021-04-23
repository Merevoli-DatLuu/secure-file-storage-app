from django.db import models
from django.contrib.auth.models import AbstractUser

from .managers import CustomUserManager

class User(AbstractUser):
    username = None # remove username
    
    email = models.EmailField(max_length=100, unique=True)
    password = models.CharField(max_length=100)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email

    class Meta:
        db_table = 'User'
