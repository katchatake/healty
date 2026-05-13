-- 1. Tabla de Roles (Admin, Professional, Receptionist, Patient)
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Usuarios (Credenciales principales)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla intermedia para Roles (Muchos a Muchos)
CREATE TABLE user_roles (
    user_id INT,
    role_id INT,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- 3. Tabla de Sesiones (Tokens)
CREATE TABLE sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token TEXT NOT NULL,
    device_info VARCHAR(255),
    ip_address VARCHAR(45),
    is_valid BOOLEAN DEFAULT TRUE,
    expires_at DATETIME NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Tabla de Profesionales (Perfil extendido)
CREATE TABLE professionals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    specialty VARCHAR(100) NOT NULL, -- Ej: Nutrición, Pediatría
    license_number VARCHAR(50) UNIQUE, -- Cédula profesional
    bio TEXT,
    phone VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Tabla de Recepcionistas
CREATE TABLE receptionists (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    assigned_to_professional_id INT NULL, -- Por si trabaja para un médico específico
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to_professional_id) REFERENCES professionals(id) ON DELETE SET NULL
);

-- 6. Tabla de Pacientes (Público General)
CREATE TABLE patients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20),
    phone VARCHAR(20),
    emergency_contact VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Tabla de Servicios (Configurados por el profesional)
CREATE TABLE services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    professional_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration_minutes INT NOT NULL, -- Ej: 30, 60, 90
    is_visible BOOLEAN DEFAULT TRUE, -- Para exponer al público
    FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE
);

-- 8. Tabla de Citas (Appointments)
CREATE TABLE appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    professional_id INT NOT NULL,
    service_id INT NOT NULL,
    appointment_date DATETIME NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    created_by INT NOT NULL, -- ID del User que registró la cita (puede ser Recepcionista o Paciente)
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (professional_id) REFERENCES professionals(id),
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 9. Tabla de Expedientes Médicos (Medical Records)
CREATE TABLE medical_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    professional_id INT NOT NULL,
    appointment_id INT NULL,
    record_type VARCHAR(50) NOT NULL, -- Ej: 'psicologia', 'nutricion', 'general'
    notes TEXT,
    data JSON, -- Estructura flexible según la especialidad médica
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (professional_id) REFERENCES professionals(id),
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
);

-- 10. Tabla de Pagos (Payments)
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('cash', 'card', 'transfer') NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_date DATETIME,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id)
);

-- 11. Tabla de Gastos Operativos (Expenses)
CREATE TABLE expenses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    professional_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT NOT NULL,
    category ENUM('rent', 'supplies', 'salary', 'services', 'other') DEFAULT 'other',
    expense_date DATE NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (professional_id) REFERENCES professionals(id)
);

--         data  --
INSERT INTO roles (name, description) VALUES 
('Admin', 'Administrador total del sistema, gestiona usuarios y clínicas'),
('Professional', 'Especialista de salud (Nutricionista, Psicólogo, etc.) que ofrece servicios'),
('Receptionist', 'Personal de apoyo que gestiona agendas de los profesionales'),
('Patient', 'Usuario final que busca servicios y agenda citas')
('Root', 'Super Usuario con acceso total al sistema');

INSERT INTO users (email, password, is_active) 
VALUES ('root@system.com', '$2b$10$76S.H/mNfWd4H6H6X6X6XeO8O8O8O8O8O8O8O8O8O8O8O8O8O8O8', true);

-- 3. Vinculamos el usuario con el rol Admin
-- Asumiendo que el user_id es 1 y el role_id es 1
INSERT INTO user_roles (user_id, role_id) 
VALUES (
    (SELECT id FROM users WHERE email = 'root@system.com'),
    (SELECT id FROM roles WHERE name = 'Root')
);