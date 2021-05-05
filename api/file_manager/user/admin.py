from django.contrib import admin
from .models import User, UserHistory

class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name')
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password', 'first_name', 'last_name', 'is_staff', 'is_active')}
        ),
    )

class UserHistoryAdmin(admin.ModelAdmin):
    list_display = ('email', 'device_info', 'ip', 'login_time')

admin.site.register(User, UserAdmin)
admin.site.register(UserHistory, UserHistoryAdmin)