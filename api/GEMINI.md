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

### 3. Respuestas de Error

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
