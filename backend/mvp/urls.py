from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('auth/login/', views.login),
    path('auth/mfa/verify/', views.mfa_verify),
    path('auth/password-reset/', views.password_reset),
    path('auth/me/', views.me),

    # Expedientes
    path('expedientes/', views.expedientes_list),
    path('expedientes/<int:pk>/', views.expediente_detail),
    path('expedientes/<int:pk>/estado/', views.expediente_estado),
    path('expedientes/<int:pk>/recalcular-riesgo/', views.expediente_recalcular_riesgo),
    path('expedientes/<int:pk>/generar-acceso/', views.expediente_generar_acceso),
    path('expedientes/<int:pk>/documentos/', views.expediente_documentos),
    path('expedientes/<int:pk>/historial/', views.expediente_historial),
    path('expedientes/<int:pk>/observaciones/', views.expediente_observaciones),

    # Dashboard
    path('dashboard/stats/', views.dashboard_stats),

    # Alertas
    path('alertas/', views.alertas_list),
    path('alertas/activas/count/', views.alertas_activas_count),

    # Auditoria
    path('auditoria/log/', views.auditoria_log),
    path('auditoria/logs/', views.auditoria_logs),
    path('auditoria/stats/', views.auditoria_stats),

    # Usuarios
    path('usuarios/', views.usuarios_list),

    # Formulario publico (portal KYC)
    path('formularios/public/submit/', views.formulario_public_submit),
    path('formularios/public/<str:token>/', views.formulario_public_info),
]
