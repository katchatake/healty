# Guía de Despliegue con Docker en IONOS (Proyecto Healty)

Esta guía explica cómo desplegar y configurar el proyecto **Healty** en un servidor de **IONOS** usando Docker y Docker Compose de forma completamente aislada de otros proyectos existentes.

---

## 🏗️ Arquitectura del Despliegue

El proyecto se compone de 3 servicios principales corriendo en contenedores aislados sobre su propia red virtual (`healty-network`):

1. **`healty-db` (MySQL 8.0)**: Base de datos MySQL. No colisiona con el puerto `3306` del sistema porque expone de forma segura su puerto en el host como `3307` (o se puede cerrar por completo).
2. **`healty-api` (Express Node.js)**: API backend. Corre internamente en el puerto `3001` y se expone al host en el puerto `3011` para evitar choques con el puerto estándar `3001`.
3. **`healty-front` (NuxtJS 4)**: Servidor frontend compilado en producción (Nitro). Corre internamente en el puerto `3000` y se expone al host en el puerto `3010` para evitar choques con el puerto estándar `3000`.

---

## 🛠️ Configuración Inicial

### Paso 1: Clonar o subir el proyecto al servidor
Sube los archivos del proyecto a una carpeta dedicada en tu servidor de IONOS (por ejemplo, `/var/www/healty`).

### Paso 2: Crear el archivo de configuración `.env`
En la raíz del proyecto, copia la plantilla de variables de entorno:

```bash
cp .env.example .env
```

Edita el archivo `.env` configurando los valores reales:

```env
# Contraseñas de Base de Datos
DB_ROOT_PASSWORD=una_contrasena_muy_segura_para_root
DB_NAME=healty
DB_USER=healty_user
DB_PASSWORD=contrasena_del_usuario_healty
DB_HOST_PORT=3307  # Puerto expuesto en el host para MySQL

# Configuración del Backend (API)
JWT_SECRET=escribe_aqui_una_cadena_larga_y_aleatoria
API_HOST_PORT=3011 # Puerto expuesto en el host para la API
RUN_SEEDS=true      # Cambia a 'false' tras el primer inicio si no deseas re-cargar datos mock

# Configuración del Frontend
FRONT_HOST_PORT=3010 # Puerto expuesto en el host para el frontend Nuxt

# URL pública de la API desde el navegador del usuario.
# Reemplaza 'localhost' por la IP pública de tu servidor de IONOS o por tu dominio configurado.
NUXT_PUBLIC_API_BASE_URL=http://<IP_DE_TU_SERVIDOR_IONOS>:3011/api/v1
```

> [!IMPORTANT]
> `NUXT_PUBLIC_API_BASE_URL` debe apuntar a la dirección a través de la cual el **navegador del cliente** puede conectarse al backend. Si usas un dominio con SSL, configúralo como: `https://api.tu-dominio-healty.com/api/v1`.

---

## 🚀 Construir y Ejecutar los Contenedores

Una vez configurado el archivo `.env`, ejecuta el siguiente comando en la raíz del proyecto en tu servidor:

```bash
docker compose up -d --build
```

### ¿Qué hace este comando automáticamente?
1. Descarga e inicia la base de datos MySQL.
2. Espera de manera inteligente a que la base de datos responda antes de proceder.
3. Ejecuta de forma automática todas las migraciones de Sequelize en la base de datos.
4. Ejecuta las semillas iniciales (roles y usuarios de prueba si `RUN_SEEDS=true`).
5. Compila y empaqueta la aplicación de NuxtJS en modo producción (usando multi-stage builds para máxima velocidad).
6. Levanta los tres servicios en segundo plano (`-d`).

---

## 🔍 Comandos Útiles de Mantenimiento

* **Ver estado de los contenedores:**
  ```bash
  docker compose ps
  ```
* **Ver logs en tiempo real (para depuración):**
  ```bash
  docker compose logs -f
  ```
* **Ver logs específicos de la API o Base de Datos:**
  ```bash
  docker compose logs -f api
  docker compose logs -f db
  ```
* **Apagar los servicios:**
  ```bash
  docker compose down
  ```
* **Apagar los servicios eliminando los datos de la base de datos (¡Precaución!):**
  ```bash
  docker compose down -v
  ```

---

## 🗄️ Operaciones Manuales de Base de Datos (Migraciones y Semillas)

Aunque el contenedor ejecuta las migraciones de forma automática durante su arranque inicial, puedes ejecutar los comandos de Sequelize de forma manual dentro del contenedor en cualquier momento:

* **Ejecutar migraciones manualmente:**
  ```bash
  docker compose exec api npm run db:migrate
  ```
* **Ejecutar seeders manualmente (poblar la base de datos):**
  ```bash
  docker compose exec api npm run db:seed
  ```
* **Deshacer la última migración (si necesitas revertir cambios):**
  ```bash
  docker compose exec api npx sequelize-cli db:migrate:undo
  ```

---

## 🔒 Aislamiento Completo (Evitar Conflictos)

Debido a que ya tienes un proyecto en producción en el mismo servidor de IONOS (que también usa NuxtJS, Node y MySQL), este esquema garantiza aislamiento mediante:
1. **Contenedores con nombre único:** Todos los nombres empiezan con `healty-` (`healty-db`, `healty-api`, `healty-front`).
2. **Puertos configurables:** Mapeamos los puertos del host a `3010`, `3011` y `3307` por defecto, de manera que la pila de puertos estándar `3000`, `3001` y `3306` queda libre y reservada para tu otro proyecto.
3. **Red virtual privada:** La comunicación entre Nuxt, Express y MySQL se realiza dentro de la red interna de Docker (`healty-network`), previniendo cualquier cruce de tráfico o conexiones erróneas entre bases de datos de diferentes proyectos.

---

## 🌐 Configurar Dominios con un Proxy Inverso (Nginx)

Para que tus usuarios puedan acceder mediante dominios legibles y con HTTPS sin tener que ingresar el puerto (ej. `http://tu-servidor:3010`), se recomienda configurar un bloque de servidor Nginx en tu máquina host de IONOS:

### Configuración para el Frontend (ej. `clinica.tudominio.com`)
```nginx
server {
    listen 80;
    server_name clinica.tudominio.com;

    location / {
        proxy_pass http://127.0.0.1:3010; # Redirecciona al contenedor de Nuxt
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Configuración para la API (ej. `api.tudominio.com`)
```nginx
server {
    listen 80;
    server_name api.tudominio.com;

    location / {
        proxy_pass http://127.0.0.1:3011; # Redirecciona al contenedor de Express
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
*(Recuerda habilitar certificados SSL gratuitos con Let's Encrypt / Certbot tras configurar Nginx).*
