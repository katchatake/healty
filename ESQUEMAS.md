# Esquemas y Flujo del Sistema Healty API

## 🎯 Finalidad Principal del Sistema
El sistema tiene como objetivo principal servir de plataforma integral para la gestión de clínicas y consultorios médicos. Conecta a diferentes tipos de usuarios (Pacientes, Profesionales, Recepcionistas y Administradores), permitiendo coordinar citas médicas, procesar pagos por los servicios, mantener un historial clínico detallado (expedientes médicos personalizables por especialidad), y llevar un control financiero de los gastos operativos de los profesionales.

---

## 🔄 Flujo Principal del Sistema

A continuación se ilustra el flujo de negocio principal desde que un paciente solicita una cita hasta que se genera el expediente y el pago, así como el registro paralelo de gastos del profesional:

```mermaid
flowchart TD
    %% Entidades principales
    P([Paciente])
    Prof([Profesional / Recepcionista])

    %% Flujo de la Cita
    P -- Solicita --> C[Agendar Cita]
    C -- Genera --> A(Registro en tabla appointments)
    
    %% Flujo de Pago
    A -- Requiere Pago --> Pay(Registro en tabla payments)
    Pay -- Efectivo/Tarjeta --> Status[Estado: Completado]

    %% Flujo de Consulta y Expediente
    A -- Día de la Consulta --> Cons[Consulta Médica]
    Prof -- Atiende y evalúa --> Cons
    Cons -- Genera/Actualiza --> MR(Registro en tabla medical_records)
    
    %% Datos Flexibles del Expediente
    MR -- Almacena --> JSON[Datos JSON por Especialidad]

    %% Flujo de Gastos
    Prof -- Compra insumos/Paga renta --> Exp(Registro en tabla expenses)
    Exp -- Contabilidad --> Fin[Cálculo de Ganancias Netas]

    %% Estilos
    classDef default fill:#f9f9f9,stroke:#333,stroke-width:2px;
    classDef table fill:#e1f5fe,stroke:#0288d1,stroke-width:2px;
    class A,Pay,MR,Exp table;
```

---

## 🗄️ Diagrama de Entidad-Relación (ER)

El siguiente diagrama muestra cómo se relacionan todas las entidades a nivel de base de datos.

```mermaid
erDiagram
    users ||--o{ user_roles : has
    roles ||--o{ user_roles : has
    users ||--o{ sessions : logs_in
    users ||--o| professionals : is_a
    users ||--o| receptionists : is_a
    users ||--o| patients : is_a

    professionals ||--o{ receptionists : assigned_to
    professionals ||--o{ services : offers
    professionals ||--o{ expenses : incurs

    patients ||--o{ appointments : books
    professionals ||--o{ appointments : scheduled_with
    services ||--o{ appointments : for

    appointments ||--o| payments : generates
    appointments ||--o| medical_records : generates_during
    patients ||--o{ medical_records : owns
    professionals ||--o{ medical_records : writes

    users {
        int id PK
        string email
        string password
        boolean is_active
    }
    roles {
        int id PK
        string name
    }
    professionals {
        int id PK
        int user_id FK
        string full_name
        string specialty
    }
    patients {
        int id PK
        int user_id FK
        string full_name
    }
    appointments {
        int id PK
        int patient_id FK
        int professional_id FK
        int service_id FK
        datetime appointment_date
        string status
    }
    medical_records {
        int id PK
        int patient_id FK
        int professional_id FK
        int appointment_id FK
        string record_type
        json data
    }
    payments {
        int id PK
        int appointment_id FK
        decimal amount
        string payment_method
        string status
    }
    expenses {
        int id PK
        int professional_id FK
        decimal amount
        string category
    }
```

---

## 📖 Diccionario de Tablas

### Módulo de Autenticación y Usuarios
*   **`roles`**: Catálogo de roles del sistema (`Admin`, `Professional`, `Receptionist`, `Patient`, `Root`).
*   **`users`**: Almacena las credenciales principales (email y contraseña) de cualquier tipo de usuario.
*   **`user_roles`**: Tabla intermedia que permite que un usuario tenga múltiples roles.
*   **`sessions`**: Control de sesiones activas (Tokens JWT, IPs, dispositivos).

### Módulo de Perfiles
*   **`professionals`**: Perfil extendido de los médicos/especialistas. Guarda su especialidad y cédula.
*   **`receptionists`**: Perfil del personal de apoyo, puede estar asignado a un profesional específico.
*   **`patients`**: Perfil de los pacientes. Almacena fecha de nacimiento, género y contacto de emergencia.

### Módulo de Citas y Servicios
*   **`services`**: Catálogo de servicios configurados por cada profesional (con precio y duración).
*   **`appointments`**: Tabla central que vincula a un paciente, un profesional y un servicio en una fecha y hora determinadas.

### Módulo Clínico y Financiero
*   **`medical_records`**: Almacena los expedientes clínicos de los pacientes. Utiliza un campo `data` de tipo `JSON` para ser flexible a cualquier especialidad médica.
*   **`payments`**: Registra los pagos vinculados a una cita (`appointment_id`).
*   **`expenses`**: Registra los gastos operativos reportados por un profesional, lo que permite posteriormente generar reportes financieros de ganancias vs. gastos.
