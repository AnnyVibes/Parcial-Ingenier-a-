from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.rol == 'admin'


class IsAdminOrOficial(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.rol in ['admin', 'oficial']


class IsAnalista(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.rol in ['admin', 'oficial', 'analista']


class IsAuditor(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.rol in ['admin', 'auditor']


class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.rol == 'admin' or obj == request.user
