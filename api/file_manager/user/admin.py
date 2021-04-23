from django.contrib import admin
from .models import User

class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name')
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password', 'first_name', 'last_name', 'is_staff', 'is_active')}
        ),
    )

admin.site.register(User, UserAdmin)