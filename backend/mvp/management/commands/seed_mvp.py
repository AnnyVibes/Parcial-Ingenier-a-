"""
Carga datos demo para el MVP: usuarios (credenciales que espera el frontend),
clientes, expedientes, evaluaciones de riesgo, alertas y movimientos de workflow.

Uso:  python manage.py seed_mvp
Idempotente: limpia los datos demo y los vuelve a crear.
"""
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import User
from clients.models import Cliente
from expedientes.models import Expediente
from aml_kyc.models import EvaluacionRiesgo
from alertas.models import Alerta
from workflow.models import Workflow


USUARIOS = [
    # (username, email, password, rol, nombre, apellido)
    ('admin',       'admin@dda.test',       'admin123',   'admin',    'Ana',    'Admin'),
    ('oficial',     'oficial@dda.test',     'oficial123', 'oficial',  'Oscar',  'Oficial'),
    ('colaborador', 'colaborador@dda.test', 'colab123',   'analista', 'Carla',  'Colaboradora'),
    ('auditor',     'auditor@dda.test',     'auditor123', 'auditor',  'Aldo',   'Auditor'),
]

# (nombre, tipo_doc, estado, nivel, score, factores, meses_venc)
EXPEDIENTES = [
    ('Comercializadora Istmeña, S.A.',     'NIT', 'aprobado',    'bajo',    18, [], 4),
    ('Roberto Antonio Núñez Quintero',     'CC',  'aprobado',    'bajo',    12, [], 1),
    ('Inversiones Marbella Holdings Corp.', 'NIT', 'en_revision', 'alto',    78,
     ['Sector de actividad de alto riesgo', 'Estructura societaria compleja u opaca'], -1),
    ('María Fernanda Saavedra Pinto',      'CC',  'pendiente',   'medio',   45,
     ['Volumen de transacciones inusualmente alto'], None),
    ('Grupo Logístico Caribe, S.A.',       'NIT', 'en_revision', 'medio',   52,
     ['Estructura societaria compleja u opaca'], None),
    ('Tecnología y Soluciones Delta',      'NIT', 'aprobado',    'bajo',    22, [], 6),
    ('Juan Carlos Mendoza Real',           'CC',  'rechazado',   'critico', 88,
     ['Aparece en lista restrictiva (OFAC/ONU/UE)', 'Persona Políticamente Expuesta'], None),
    ('Distribuidora Pacífico Sur',         'NIT', 'pendiente',   'bajo',    15, [], None),
    ('Importadora Andina Express',         'NIT', 'aprobado',    'medio',   48, [], 0),
    ('Lucía Esperanza Galván Ortiz',       'CC',  'en_revision', 'alto',    72,
     ['Persona Políticamente Expuesta'], None),
]


class Command(BaseCommand):
    help = 'Carga datos demo para el MVP'

    def handle(self, *args, **options):
        self.stdout.write('Limpiando datos demo previos...')
        Workflow.objects.all().delete()
        EvaluacionRiesgo.objects.all().delete()
        Alerta.objects.all().delete()
        Expediente.objects.all().delete()
        Cliente.objects.all().delete()

        # --- Usuarios ---
        users = {}
        for username, email, pwd, rol, nombre, apellido in USUARIOS:
            user, _ = User.objects.get_or_create(
                username=username,
                defaults={'email': email, 'rol': rol, 'first_name': nombre, 'last_name': apellido},
            )
            user.email = email
            user.rol = rol
            user.first_name = nombre
            user.last_name = apellido
            user.is_active = True
            user.two_factor_enabled = False  # login directo en demo
            if username == 'admin':
                user.is_staff = True
                user.is_superuser = True
            user.set_password(pwd)
            user.save()
            users[username] = user
        self.stdout.write(self.style.SUCCESS(f'  {len(users)} usuarios listos'))

        analista = users['colaborador']
        oficial = users['oficial']
        ahora = timezone.now()

        # --- Expedientes + clientes + evaluaciones ---
        creados = 0
        for i, (nombre, tipo_doc, estado, nivel, score, factores, meses_venc) in enumerate(EXPEDIENTES, 1):
            cliente = Cliente.objects.create(
                tipo_documento=tipo_doc,
                numero_documento=f'{tipo_doc}-{1000 + i}',
                nombre_completo=nombre,
                email=f'cliente{i}@ejemplo.test',
                telefono=f'+507 6000-00{i:02d}',
                nacionalidad='PA',
                occupation='Comercio' if tipo_doc == 'NIT' else 'Empleado',
                income_range='alto' if score > 50 else 'medio',
            )

            venc = None
            if meses_venc is not None:
                venc = (ahora + timedelta(days=meses_venc * 30)).date()

            exp = Expediente.objects.create(
                cliente=cliente,
                analista=analista,
                codigo=f'EXP-2026-{i:04d}',
                estado=estado,
                nivel_riesgo=nivel,
                fecha_vencimiento=venc,
                fecha_cierre=ahora if estado == 'aprobado' else None,
            )

            EvaluacionRiesgo.objects.create(
                cliente=cliente, expediente=exp, evaluado_por=oficial,
                score=score, nivel_riesgo=nivel,
                resultado_aml={'score': score, 'nivel': nivel, 'factores_activados': factores,
                               'recomendaciones': []},
            )

            # Movimiento de workflow para el historial
            if estado in ('en_revision', 'aprobado', 'rechazado'):
                Workflow.objects.create(
                    expediente=exp, estado_anterior='pendiente', estado_nuevo='en_revision',
                    ejecutado_por=analista, comentarios='Asignado a revisión.',
                )
            if estado in ('aprobado', 'rechazado'):
                Workflow.objects.create(
                    expediente=exp, estado_anterior='en_revision', estado_nuevo=estado,
                    ejecutado_por=oficial,
                    comentarios='Aprobado tras verificación.' if estado == 'aprobado' else 'Rechazado por riesgo.',
                )

            # Alertas para riesgo alto/critico
            if nivel in ('alto', 'critico'):
                Alerta.objects.create(
                    cliente=cliente, tipo='alto_riesgo', estado='nueva', nivel_severidad='alta',
                    descripcion=f'{nombre} obtuvo score {score}/100. Requiere revisión.',
                )
            creados += 1

        self.stdout.write(self.style.SUCCESS(f'  {creados} expedientes con clientes, evaluaciones y alertas'))
        self.stdout.write(self.style.SUCCESS('Seed completado.'))
