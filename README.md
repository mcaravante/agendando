# Agendando

Aplicación web para programación de reuniones (estilo Calendly).

## Stack Tecnológico

- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express + TypeScript + Prisma
- **Base de datos**: PostgreSQL

## Requisitos Previos

- Node.js 18+
- PostgreSQL 15+
- npm o yarn

## Instalación

### 1. Base de Datos

```bash
# Crear la base de datos PostgreSQL
createdb agendando
```

### 2. Backend

```bash
cd backend

# Instalar dependencias
npm install

# Generar cliente Prisma
npm run db:generate

# Ejecutar migraciones
npm run db:push

# Iniciar en modo desarrollo
npm run dev
```

El backend estará disponible en `http://localhost:3002`

### 3. Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## Variables de Entorno

### Backend (.env)

```env
DATABASE_URL=postgresql://localhost:5432/agendando
JWT_SECRET=tu-secreto-seguro
JWT_EXPIRES_IN=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
FRONTEND_URL=http://localhost:5173
PORT=3000
```

### Frontend (.env)

```env
VITE_API_URL=/api
```

## Características

- ✅ Registro e inicio de sesión con JWT
- ✅ Creación de tipos de eventos personalizados
- ✅ Configuración de disponibilidad semanal
- ✅ Página pública de reservas
- ✅ Calendario con selección de fecha y hora
- ✅ Sistema de reservas con prevención de conflictos
- ✅ Envío de emails de confirmación
- ✅ Cancelación de reuniones por host o invitado
- ✅ Soporte para múltiples zonas horarias
- ✅ Dashboard con próximas reuniones

## Estructura del Proyecto

```
/agendando
├── /backend
│   ├── /prisma         # Schema de base de datos
│   └── /src
│       ├── /routes     # Rutas de la API
│       ├── /services   # Lógica de negocio
│       ├── /middleware # Auth, validación, errores
│       └── /utils      # JWT, timezone, ICS
│
├── /frontend
│   └── /src
│       ├── /components # Componentes React
│       ├── /pages      # Páginas de la aplicación
│       ├── /contexts   # AuthContext
│       ├── /hooks      # useTimezone, useAuth
│       └── /utils      # API client, date helpers
│
└── README.md
```

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuario actual

### Usuarios
- `PATCH /api/users/me` - Actualizar perfil
- `POST /api/users/avatar` - Subir avatar

### Tipos de Eventos
- `GET /api/event-types` - Listar
- `POST /api/event-types` - Crear
- `PATCH /api/event-types/:id` - Actualizar
- `DELETE /api/event-types/:id` - Eliminar

### Disponibilidad
- `GET /api/availability` - Obtener disponibilidad
- `PUT /api/availability` - Actualizar disponibilidad
- `GET /api/availability/config` - Configuración
- `PATCH /api/availability/config` - Actualizar config

### Reservas
- `POST /api/bookings` - Crear reserva
- `GET /api/bookings` - Listar reservas
- `PATCH /api/bookings/:id/cancel` - Cancelar (host)
- `POST /api/bookings/cancel/:token` - Cancelar (invitado)

### Público
- `GET /api/public/:username` - Perfil público
- `GET /api/public/:username/:eventSlug` - Evento específico
- `GET /api/public/:username/:eventSlug/slots` - Horarios disponibles

## Licencia

MIT
