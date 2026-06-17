"""
Tests de integracion del contrato MVP. Cubren el flujo demo de punta a punta.
Correr: python manage.py test mvp
"""
from rest_framework.test import APITestCase
from rest_framework import status

from accounts.models import User
from clients.models import Cliente
from expedientes.models import Expediente
from aml_kyc.models import EvaluacionRiesgo
from alertas.models import Alerta


class MVPFlowTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.admin = User.objects.create_user(
            username='admin', email='admin@dda.test', password='admin123',
            rol='admin', first_name='Ana', last_name='Admin', is_active=True,
        )

    def auth(self):
        r = self.client.post('/api/auth/login/', {'email': 'admin@dda.test', 'password': 'admin123'}, format='json')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {r.data["access"]}')
        return r

    # --- Auth ---
    def test_login_ok_shape(self):
        r = self.auth()
        self.assertEqual(r.status_code, 200)
        self.assertFalse(r.data['requires_mfa'])
        self.assertEqual(r.data['user']['rol'], 'ADMINISTRADOR')
        self.assertIn('access', r.data)

    def test_login_bad_credentials(self):
        r = self.client.post('/api/auth/login/', {'email': 'admin@dda.test', 'password': 'mala'}, format='json')
        self.assertEqual(r.status_code, 401)

    def test_endpoints_requieren_auth(self):
        self.assertEqual(self.client.get('/api/expedientes/').status_code, 401)
        self.assertEqual(self.client.get('/api/dashboard/stats/').status_code, 401)

    def test_me(self):
        self.auth()
        r = self.client.get('/api/auth/me/')
        self.assertEqual(r.data['email'], 'admin@dda.test')

    # --- Portal publico -> expediente completo ---
    def test_submit_publico_crea_todo(self):
        payload = {
            'nombre_razon_social': 'Constructora Demo S.A.',
            'email': 'demo@empresa.test', 'telefono': '60001111',
            'beneficiarios': [{'nombres': 'Juan', 'apellidos': 'Pérez', 'porcentaje': 60}],
            'firma': 'data:image/png;base64,xxx',
            'doc_ruc': {'nombre': 'ruc.pdf', 'tamano': 1024, 'tipo': 'application/pdf'},
            'doc_estados_financieros': {'nombre': 'ef.pdf', 'tamano': 2048, 'tipo': 'application/pdf'},
        }
        r = self.client.post('/api/formularios/public/submit/', payload, format='json',
                             HTTP_X_FORM_TOKEN='demo-juridica-001')
        self.assertEqual(r.status_code, 201)
        codigo = r.data['expediente_numero']

        exp = Expediente.objects.get(codigo=codigo)
        self.assertEqual(exp.cliente.nombre_completo, 'Constructora Demo S.A.')
        self.assertEqual(exp.cliente.tipo_documento, 'NIT')  # juridica
        self.assertEqual(exp.datos_kyc['beneficiarios'][0]['porcentaje'], 60)
        self.assertEqual(exp.documentos.count(), 2)  # 2 doc_*
        self.assertTrue(exp.evaluaciones.exists())  # evaluacion automatica

    # --- Expedientes ---
    def _crear_exp(self, estado='pendiente', nivel='bajo', score=10):
        c = Cliente.objects.create(tipo_documento='CC', numero_documento=f'CC-{Cliente.objects.count()+1}',
                                   nombre_completo='Cliente Test', email='c@test.com', telefono='1')
        exp = Expediente.objects.create(cliente=c, codigo=f'EXP-T-{Expediente.objects.count()+1}',
                                        estado=estado, nivel_riesgo=nivel)
        EvaluacionRiesgo.objects.create(cliente=c, expediente=exp, score=score, nivel_riesgo=nivel,
                                        resultado_aml={'factores_activados': []})
        return exp

    def test_lista_paginada_y_shape(self):
        self.auth()
        self._crear_exp()
        r = self.client.get('/api/expedientes/')
        self.assertIn('count', r.data)
        self.assertIn('results', r.data)
        e = r.data['results'][0]
        self.assertIn(e['estado'], ('PENDIENTE', 'EN_REVISION', 'APROBADO', 'RECHAZADO'))
        self.assertIn(e['nivel_riesgo'], ('BAJO', 'MEDIO', 'ALTO'))

    def test_filtro_riesgo_alto(self):
        self.auth()
        self._crear_exp(nivel='critico')
        self._crear_exp(nivel='bajo')
        r = self.client.get('/api/expedientes/?riesgo=ALTO')
        self.assertEqual(r.data['count'], 1)  # critico mapea a ALTO

    def test_cambio_estado_valido(self):
        self.auth()
        exp = self._crear_exp(estado='pendiente')
        r = self.client.patch(f'/api/expedientes/{exp.id}/estado/', {'estado': 'EN_REVISION'}, format='json')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data['estado'], 'EN_REVISION')

    def test_cambio_estado_invalido_rechazado(self):
        self.auth()
        exp = self._crear_exp(estado='pendiente')
        r = self.client.patch(f'/api/expedientes/{exp.id}/estado/', {'estado': 'APROBADO'}, format='json')
        self.assertEqual(r.status_code, 400)  # pendiente no salta directo a aprobado

    def test_aprobar_resuelve_alertas(self):
        self.auth()
        exp = self._crear_exp(estado='en_revision', nivel='alto')
        Alerta.objects.create(cliente=exp.cliente, tipo='alto_riesgo', estado='nueva', nivel_severidad='alta',
                              descripcion='x')
        self.client.patch(f'/api/expedientes/{exp.id}/estado/', {'estado': 'APROBADO'}, format='json')
        self.assertEqual(Alerta.objects.filter(cliente=exp.cliente, estado='resuelta').count(), 1)

    def test_recalcular_riesgo(self):
        self.auth()
        exp = self._crear_exp()
        r = self.client.post(f'/api/expedientes/{exp.id}/recalcular-riesgo/')
        self.assertEqual(r.status_code, 200)
        self.assertIn('score_riesgo', r.data)

    def test_observaciones(self):
        self.auth()
        exp = self._crear_exp()
        rp = self.client.post(f'/api/expedientes/{exp.id}/observaciones/', {'texto': 'Revisar'}, format='json')
        self.assertEqual(rp.status_code, 201)
        rg = self.client.get(f'/api/expedientes/{exp.id}/observaciones/')
        self.assertEqual(len(rg.data), 1)

    # --- Dashboard / listados ---
    def test_dashboard_stats_shape(self):
        self.auth()
        self._crear_exp(estado='aprobado')
        r = self.client.get('/api/dashboard/stats/')
        for k in ('total_expedientes', 'aprobados', 'alto_riesgo', 'distribucion_riesgo',
                  'estadisticas_mensuales', 'actividad_reciente'):
            self.assertIn(k, r.data)

    def test_usuarios_y_auditoria(self):
        self.auth()
        self.assertEqual(self.client.get('/api/usuarios/').data['count'], 1)
        self.assertIn('results', self.client.get('/api/auditoria/logs/').data)
