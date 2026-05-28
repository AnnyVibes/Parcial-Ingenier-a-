# Sistema AML/KYC — Plataforma de Cumplimiento Normativo

Sistema integral de gestión de cumplimiento Anti-Money Laundering (AML) y Know Your Customer (KYC), con motor de evaluación de riesgo, workflow de aprobación, auditoría completa y dashboard de calidad de código.

---

## Stack Tecnologico

| Capa | Tecnologia | Por que |
|---|---|---|
| **Backend** | Python + Django REST Framework | Admin integrado, ORM poderoso, auth/RBAC nativo, ideal para auditoria con `django-simple-history`, ecosistema maduro para motores de riesgo/reglas |
| **Frontend Admin** | React + TypeScript + TailwindCSS + Shadcn/ui | Dashboard complejo, componentes reutilizables, TypeScript para seguridad de tipos |
| **Frontend Publico** | React + Vite (standalone) | Formulario KYC ligero, sin necesidad de SSR |
| **Base de Datos** | PostgreSQL | JSONB para formularios dinamicos, robustez transaccional |
| **MFA** | django-otp + TOTP | Integracion directa con Django |
| **Documentos** | MinIO (S3-compatible) | Almacenamiento seguro con expiracion de URLs |
| **Auth** | JWT (djangorestframework-simplejwt) | Stateless, seguro |
| **Worker** | Celery + Redis | Tareas asincronas: renovacion, alertas, evaluaciones |
| **QA Dashboard** | Script Bash + Python + Chart.js | Reporte visual historico con tendencias |

---

## Estructura del Proyecto

```
Parcial-Ingenieria/
├── backend/                          # Django REST API
│   ├── config/                       # Settings, urls, wsgi
│   ├── apps/
│   │   ├── accounts/                 # Usuarios, roles, permisos (RBAC), MFA
│   │   ├── clients/                  # Clientes, formularios KYC publicos
│   │   ├── expedientes/              # Gestion completa de expedientes
│   │   ├── aml_kyc/                  # Motor de evaluacion de riesgo
│   │   ├── pep_lists/                # PEP y listas restrictivas
│   │   ├── workflow/                 # Workflow de aprobacion/revision
│   │   ├── auditoria/                # Log de auditoria (cada accion)
│   │   ├── documentos/               # Gestion documental segura
│   │   ├── alertas/                  # Sistema de alertas y reporteria
│   │   └── dashboard/                # Metricas y endpoints del dashboard
│   ├── media/                        # Archivos subidos
│   └── requirements.txt
├── frontend-admin/                   # React + TypeScript (panel de control)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/                 # API calls
│   │   └── contexts/
│   └── package.json
├── frontend-public/                  # Portal publico (formulario KYC)
│   ├── src/
│   └── package.json
├── qa-dashboard/                     # Herramienta de calidad de codigo
│   ├── codacy_quality.sh             # Script bash de analisis
│   ├── generate_report.py            # Genera HTML con historico
│   ├── dashboard.html                # Dashboard generado (no editar manualmente)
│   └── reports/                      # JSONs historicos por fecha (YYYY-MM-DD.json)
└── docker-compose.yml
```

---

## Como ejecutar el proyecto

### Requisitos previos

- Python 3.11+
- Node.js 18+ y npm
- PostgreSQL 15+
- Redis 7+
- Docker y Docker Compose (opcional pero recomendado)

---

### Backend (Django)

```bash
# Crear y activar entorno virtual
cd backend
python3 -m venv venv
source venv/bin/activate          # Linux/macOS
# venv\Scripts\activate           # Windows

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno (copiar y editar)
cp .env.example .env

# Aplicar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Iniciar servidor de desarrollo
python manage.py runserver
# Disponible en http://localhost:8000
# Admin en     http://localhost:8000/admin
```

### Worker Celery (tareas asincronas)

```bash
# En una terminal separada, con el venv activo
cd backend
celery -A config worker --loglevel=info

# Para el beat scheduler (tareas periodicas)
celery -A config beat --loglevel=info
```

---

### Frontend Admin (React + TypeScript)

```bash
cd frontend-admin

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
# Disponible en http://localhost:5173

# Compilar para produccion
npm run build
```

### Frontend Publico — Portal KYC

```bash
cd frontend-public

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
# Disponible en http://localhost:5174

# Compilar para produccion
npm run build
```

---

### Levantar todo con Docker Compose

```bash
# Desde la raiz del proyecto
docker compose up --build

# En segundo plano
docker compose up -d --build

# Ver logs
docker compose logs -f

# Detener
docker compose down
```

---

## QA Dashboard — Analisis de Calidad de Codigo

El script `codacy_quality.sh` analiza el codigo del proyecto con herramientas estaticas (ESLint, Pylint/flake8, Bandit, Radon) y acumula los resultados en `qa-dashboard/reports/` como JSONs por fecha. El dashboard HTML se genera a partir de ese historial.

### Comandos disponibles

```bash
cd qa-dashboard

# Ver ayuda
bash codacy_quality.sh --help

# Solo analizar (sin guardar)
bash codacy_quality.sh

# Analizar y guardar reporte en reports/YYYY-MM-DD.json
bash codacy_quality.sh --save

# Analizar, guardar y regenerar el dashboard HTML
bash codacy_quality.sh --save --dashboard

# Regenerar el dashboard manualmente desde los reportes existentes
python3 generate_report.py

# Regenerar y servir en http://localhost:8080
python3 generate_report.py --serve
```

### Que genera el dashboard

Archivo de salida: `qa-dashboard/dashboard.html`

Abrirlo directamente en el navegador o servirlo con `generate_report.py --serve`.

Incluye:

- **Grafico de lineas** — evolucion de issues criticos, medios y bajos por dia
- **Grafico de dona** — distribucion actual por categoria (sintaxis, complejidad, seguridad)
- **Tabla de issues** — detalle de archivo, tipo, severidad, linea y descripcion
- **Tabla historica** — fechas de revision con totales y delta vs dia anterior
- **Badges de estado** — Saludable / Atencion / Critico segun umbrales automaticos

### Logica de estado

| Condicion | Estado |
|---|---|
| Criticos > 5 | Critico |
| Criticos > 0 o Medios > 5 | Atencion |
| Sin lo anterior | Saludable |

### Herramientas opcionales (mejoran el analisis)

```bash
pip install pylint flake8 bandit radon
npm install -g eslint
```

Si no estan instaladas, el script usa grep como fallback e informa cuales checks se omitieron.

---

## Variables de entorno principales

```env
# backend/.env
SECRET_KEY=tu-clave-secreta
DEBUG=True
DATABASE_URL=postgres://user:password@localhost:5432/amlkyc
REDIS_URL=redis://localhost:6379/0
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

---

## Modulos del backend

| Modulo | Responsabilidad |
|---|---|
| `accounts` | Usuarios, roles (RBAC), MFA con TOTP |
| `clients` | Registro de clientes, formularios KYC publicos |
| `expedientes` | Ciclo de vida completo de cada expediente |
| `aml_kyc` | Motor de evaluacion y puntuacion de riesgo |
| `pep_lists` | Cruce contra listas PEP y restrictivas |
| `workflow` | Aprobacion, revision y escalado de expedientes |
| `auditoria` | Registro inmutable de cada accion del sistema |
| `documentos` | Subida, almacenamiento y acceso seguro a documentos |
| `alertas` | Generacion y envio de alertas automaticas |
| `dashboard` | Endpoints de metricas para el frontend admin |
