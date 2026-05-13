# Healty API - Documentación del Proyecto

## Descripción General
El proyecto es el backend para una aplicación de gestión de citas de salud integral. Conecta a administradores, profesionales, recepcionistas y pacientes, permitiendo además:
- La gestión de **expedientes médicos especializados** por área (ej. psicología, nutrición, quiropráctica), siendo escalable para añadir nuevas áreas.
- El control de **pagos de citas**.
- El seguimiento detallado de **gastos y cobros** por cada profesional médico.

## Stack Tecnológico
- **Entorno:** Node.js v20+
- **Framework:** Express.js
- **Base de Datos:** MySQL
- **ORM:** Sequelize
- **Autenticación:** JWT (JSON Web Tokens)
- **Validación:** Joi
- **Gestión de Errores:** @hapi/boom
- **Logging:** Winston

## Arquitectura del Proyecto
Se sigue un patrón modular por versiones (`api/v1/modules`) bajo la estructura **Controller-Service-DAO-DTO**:
- **Routes:** Define los endpoints y aplica middlewares.
- **Controller:** Maneja la entrada/salida HTTP.
- **Service:** Contiene la lógica de negocio central.
- **DAO (Data Access Object):** Interacción directa con los modelos de Sequelize.
- **DTO (Data Transfer Object):** Esquemas de validación con Joi.

## Seguridad y Autenticación
- Se utiliza JWT para proteger rutas. 
- Las rutas de usuarios están restringidas por roles (ej: `Admin` para operaciones de escritura).
- Contraseñas encriptadas con **Bcryptjs**.

## Gestión de Errores
- Uso global de **Boom** para respuestas HTTP estandarizadas.
- Los errores de validación de Joi devuelven un código 400 con los campos fallidos en un arreglo `errors`.

---

## Ejemplos de Peticiones y Respuestas

### 1. Autenticación (Auth)
#### Login
`POST /api/v1/auth/login`

**Request Payload:**
```json
{
  "email": "admin@healty.com",
  "password": "password123"
}
```

**Response Payload (Success 200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "admin@healty.com",
      "roles": ["Admin"],
      "created_at": "2024-03-26T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2. Usuarios (Users)
#### Crear Usuario (Solo Admin)
`POST /api/v1/users`

**Request Payload:**
```json
{
  "email": "nuevo@doctor.com",
  "password": "securepassword",
  "is_active": true
}
```

**Response Payload (Success 201):**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "email": "nuevo@doctor.com",
    "is_active": true,
    "created_at": "2024-03-26T12:00:00.000Z"
  }
}
```

#### Obtener Todos los Usuarios
`GET /api/v1/users`

**Response Payload (Success 200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "admin@healty.com",
      "is_active": true,
      "roles": [{ "name": "Admin" }]
    }
  ]
}
```

#### Obtener Usuario por ID
`GET /api/v1/users/:id`
- **Params (Joi):** `id` (integer, requerido)

#### Actualizar Usuario (Parcial)
`PATCH /api/v1/users/:id`
- **Roles:** `Admin`, `Root`
- **Params (Joi):** `id` (integer, requerido)
- **Request Payload (Joi - Opcional):**
```json
{
  "email": "nuevo_email@doctor.com",
  "password": "newpassword123",
  "is_active": false
}
```

#### Eliminar Usuario
`DELETE /api/v1/users/:id`
- **Roles:** `Admin`, `Root`
- **Params (Joi):** `id` (integer, requerido)

---

### 3. Profesionales (Professionals)

#### Crear Profesional (Admin/Root)
`POST /api/v1/professionals`
- **Request Payload (Joi):**
```json
{
  "user_id": 5,
  "full_name": "Dr. Juan Pérez",
  "specialty": "Nutrición",
  "license_number": "12345678",
  "bio": "Especialista en nutrición deportiva.",
  "phone": "555-1234"
}
```

#### Obtener Todos los Profesionales
`GET /api/v1/professionals`
- **Response Payload:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 5,
      "full_name": "Dr. Juan Pérez",
      "specialty": "Nutrición",
      "user": {
        "id": 5,
        "email": "nuevo@doctor.com",
        "is_active": true
      }
    }
  ]
}
```

#### Obtener Profesional por ID
`GET /api/v1/professionals/:id`
- **Params (Joi):** `id` (integer, requerido)

#### Actualizar Profesional (Parcial)
`PATCH /api/v1/professionals/:id`
- **Roles:** `Admin`, `Root`
- **Params (Joi):** `id` (integer, requerido)
- **Request Payload (Joi - Opcional):**
```json
{
  "specialty": "Nutrición Clínica",
  "phone": "555-9999"
}
```

#### Eliminar Profesional
`DELETE /api/v1/professionals/:id`
- **Roles:** `Admin`, `Root`
- **Params (Joi):** `id` (integer, requerido)

---

### 4. Servicios (Services)

#### Crear Servicio (Admin/Root)
`POST /api/v1/services`
- **Request Payload (Joi):**
```json
{
  "professional_id": 1,
  "name": "Consulta Nutricional Inicial",
  "description": "Evaluación corporal y plan alimenticio a medida.",
  "price": 500.00,
  "duration_minutes": 60,
  "is_visible": true
}
```

#### Obtener Todos los Servicios
`GET /api/v1/services`
- **Response Payload:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "professional_id": 1,
      "name": "Consulta Nutricional Inicial",
      "price": "500.00",
      "duration_minutes": 60,
      "professional": {
        "id": 1,
        "full_name": "Dr. Juan Pérez",
        "specialty": "Nutrición"
      }
    }
  ]
}
```

#### Obtener Servicios por Médico
`GET /api/v1/services/professional/:professionalId`
- **Params (Joi):** `professionalId` (integer, requerido)

#### Actualizar Servicio (Parcial)
`PATCH /api/v1/services/:id`
- **Roles:** `Admin`, `Root`
- **Params (Joi):** `id` (integer, requerido)
- **Request Payload (Joi - Opcional):**
```json
{
  "price": 600.00,
  "is_visible": false
}
```

#### Eliminar Servicio
`DELETE /api/v1/services/:id`
- **Roles:** `Admin`, `Root`
- **Params (Joi):** `id` (integer, requerido)

---

### 5. Pacientes (Patients)

#### Crear Paciente
`POST /api/v1/patients`
- **Roles:** `Admin`, `Root`, `Receptionist`, `Professional`
- **Request Payload (Joi):**
```json
{
  "user_id": 10,
  "full_name": "María González",
  "date_of_birth": "1990-05-14",
  "gender": "Femenino",
  "phone": "555-8765",
  "emergency_contact": "Pedro González (555-0000)"
}
```

#### Obtener Todos los Pacientes
`GET /api/v1/patients`
- **Response Payload:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 10,
      "full_name": "María González",
      "date_of_birth": "1990-05-14",
      "user": {
        "id": 10,
        "email": "maria@paciente.com",
        "is_active": true
      }
    }
  ]
}
```

#### Obtener Paciente por ID
`GET /api/v1/patients/:id`
- **Params (Joi):** `id` (integer, requerido)

#### Actualizar Paciente (Parcial)
`PATCH /api/v1/patients/:id`
- **Roles:** `Admin`, `Root`, `Receptionist`, `Professional`
- **Params (Joi):** `id` (integer, requerido)
- **Request Payload (Joi - Opcional):**
```json
{
  "phone": "555-1111",
  "emergency_contact": "Juan González (555-2222)"
}
```

#### Eliminar Paciente
`DELETE /api/v1/patients/:id`
- **Roles:** `Admin`, `Root`
- **Params (Joi):** `id` (integer, requerido)

---

### 6. Respuestas de Error

#### Error de Validación (Joi)
`Status: 400 Bad Request`
```json
{
  "success": false,
  "status": 400,
  "error": "Bad Request",
  "message": "Validation Error",
  "errors": [
    {
      "message": "\"email\" must be a valid email",
      "path": ["email"]
    }
  ]
}
```

#### Error de Autenticación (Boom)
`Status: 401 Unauthorized`
```json
{
  "success": false,
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid email or password"
}
```
