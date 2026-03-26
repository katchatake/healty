# Análisis del Proyecto "Healty API"

## Descripción General

El proyecto es el backend (API) para una aplicación de gestión de citas de salud. La plataforma permite la interacción entre diferentes tipos de usuarios: administradores, profesionales de la salud, recepcionistas y pacientes.

## Estructura de la Base de Datos

El esquema de la base de datos se organiza en torno a las siguientes entidades principales:

*   **Gestión de Usuarios y Roles:**
    *   `users`: Almacena la información básica de inicio de sesión (email y contraseña).
    *   `roles`: Define los roles del sistema (ej. "Admin", "Professional", "Patient").
    *   `user_roles`: Asigna roles a los usuarios.
    *   `sessions`: Gestiona los tokens de sesión para la autenticación.

*   **Perfiles de Usuario:**
    *   `professionals`: Información específica de los profesionales de la salud.
    *   `receptionists`: Perfil de los recepcionistas.
    *   `patients`: Datos de los pacientes.

*   **Lógica de Negocio:**
    *   `services`: Describe los servicios ofrecidos por cada profesional (precio, duración).
    *   `appointments`: Tabla central que registra las citas, conectando pacientes, profesionales y servicios. Gestiona el estado de la cita (`pending`, `confirmed`, `completed`, `cancelled`).

## Conclusión

El backend está diseñado para una plataforma de salud donde los profesionales pueden ofrecer servicios y los pacientes pueden agendar citas. La base de datos está bien estructurada para soportar esta funcionalidad.
