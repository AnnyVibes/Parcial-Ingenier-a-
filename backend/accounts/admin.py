from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'rol', 'is_active']
    list_filter = ['rol', 'is_active']
