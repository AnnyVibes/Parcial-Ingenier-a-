from celery import shared_task
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
import datetime


@shared_task
def verificar_expedientes_por_vencer():
    """
    Corre diariamente. Detecta expedientes aprobados que vencen en 30 días
    y envía notificación al cliente y al analista asignado.
    """
    from .models import Expediente

    hoy = timezone.now().date()
    limite = hoy + datetime.timedelta(days=30)

    proximos = Expediente.objects.filter(
        estado='aprobado',
        fecha_vencimiento__lte=limite,
        fecha_vencimiento__gte=hoy,
    ).select_related('cliente', 'analista')

    notificados = 0
    for exp in proximos:
        dias_restantes = (exp.fecha_vencimiento - hoy).days
        _notificar_vencimiento(exp, dias_restantes)
        notificados += 1

    return f'{notificados} expedientes notificados'


@shared_task
def marcar_expedientes_vencidos():
    """
    Corre diariamente. Cambia a 'vencido' los expedientes cuya fecha de vencimiento ya pasó.
    """
    from .models import Expediente

    hoy = timezone.now().date()
    vencidos = Expediente.objects.filter(
        estado='aprobado',
        fecha_vencimiento__lt=hoy,
    )
    total = vencidos.count()
    vencidos.update(estado='vencido')
    return f'{total} expedientes marcados como vencidos'


def _notificar_vencimiento(expediente, dias_restantes):
    asunto = f'Expediente {expediente.codigo} vence en {dias_restantes} días'
    mensaje_cliente = (
        f'Estimado/a {expediente.cliente.nombre_completo},\n\n'
        f'Su expediente KYC ({expediente.codigo}) vence el {expediente.fecha_vencimiento}.\n'
        f'Por favor, contacte a su analista para iniciar el proceso de renovación.\n\n'
        f'Sistema AML/KYC'
    )
    destinatarios = [expediente.cliente.email]
    if expediente.analista and expediente.analista.email:
        mensaje_analista = (
            f'El expediente {expediente.codigo} del cliente '
            f'{expediente.cliente.nombre_completo} vence en {dias_restantes} días '
            f'({expediente.fecha_vencimiento}). Iniciar proceso de renovación.'
        )
        try:
            send_mail(
                subject=f'[AML/KYC] Alerta vencimiento: {expediente.codigo}',
                message=mensaje_analista,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[expediente.analista.email],
                fail_silently=True,
            )
        except Exception:
            pass

    try:
        send_mail(
            subject=asunto,
            message=mensaje_cliente,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=destinatarios,
            fail_silently=True,
        )
    except Exception:
        pass
