# Práctica 4 - Sistema de Autenticación 2FA

## Soluciones en la Nube - Tecsup

### 📋 Descripción del Proyecto

Sistema de autenticación web con verificación de **dos pasos (2FA)** utilizando Google Authenticator (TOTP). La aplicación está desarrollada con el framework **Express.js** en **Node.js**, utiliza **PostgreSQL** en **AWS RDS** y está completamente containerizada con **Docker**.

### ✨ Características Principales
-----
* ✅ **Registro de usuarios** con generación de Código QR (TOTP)
✅ **Autenticación de 2 Factores** (2FA) obligatoria usando Speakeasy y la app Google Authenticator.
✅ **Inicio de sesión seguro** con contraseña y validación de token 2FA.
✅ **Base de datos PostgreSQL** alojada en AWS RDS.
✅ **Interfaz moderna** utilizando CSS personalizado y Font Awesome.
✅ **Containerización** con Docker y orquestación con Docker Compose.
✅ **Infraestructura como Código (IaC)** desplegada en AWS con CloudFormation. Nombre de la plantilla: Ec2Pc4

-----

### 🛠️ Tecnologías Utilizadas

| Componente | Tecnología |
| :--- | :--- |
| **Backend** | Express.js (Node.js 18-alpine) |
| **Base de Datos** | PostgreSQL (AWS RDS) |
| **Autenticación 2FA** | Speakeasy (TOTP) + QRCode |
| **Frontend** | HTML5, CSS3, EJS, Font Awesome |
| **Containerización** | Docker + Docker Compose |
| **IaC** | AWS CloudFormation |
| **Cloud Provider** | Amazon Web Services (AWS) |

-----

### 📦 Requisitos Previos

  * **Docker y Docker Compose** (instalados en la instancia EC2).
  * **Cuenta de AWS** con RDS y EC2 configurados.
  * **Google Authenticator** (o similar app de TOTP móvil).
  * URL del repositorio Git.

### 🚀 Instalación y Ejecución (Despliegue en AWS EC2)

La aplicación está diseñada para ser desplegada en la instancia **Ubuntu 20** creada con CloudFormation.

#### 1\. Configuración de AWS

Asegúrese de que la **pila de CloudFormation** para la instancia EC2 y la **instancia RDS PostgreSQL** estén en estado `CREATE_COMPLETE` o `Disponible`.

#### 2\. Conexión y Clonación

Conéctese a su instancia EC2 vía SSH y clone el repositorio:

```bash
# Ejemplo de conexión SSH
ssh -i "pc4-key.pem" ubuntu@<IP_PUBLICA_EC2>

# Clonar el repositorio
git clone <URL_DE_TU_REPOSITORIO>
cd pc4-node-app
```

#### 3\. Configurar Variables de Entorno (Seguridad)

**IMPORTANTE:** Las credenciales de RDS (Host, Usuario, Contraseña) **NO** se suben a Git. Docker Compose las cargará desde un archivo `.env` que debe crear manualmente en la EC2.

Cree el archivo `.env` en la carpeta raíz del proyecto y complete con sus datos de RDS:

```bash
nano .env 
```

**Contenido del archivo .env:**

```env
# --- CREDENCIALES DE RDS ---
DATABASE_HOST=****.rds.amazonaws.com 
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=****
DATABASE_NAME=postgres # Nombre de la BD por defecto en RDS
# --- SECRETO DE SESIÓN ---
PORT=3000
SESSION_SECRET=UNA_CADENA_LARGA_SECRETA_Y_ALEATORIA
```

*(Guarde y salga de nano: `Ctrl+X`, `Y`, `Enter`)*

#### 4\. Ejecutar el Despliegue con Docker Compose

Ejecute el siguiente comando para construir la imagen de Node.js, instalar dependencias y levantar el contenedor en el puerto 3000:

```bash
sudo docker-compose up -d --build
```

#### 5\. Acceder a la Aplicación

Verifique que el contenedor esté activo:

```bash
sudo docker ps
```

Abra el navegador y acceda a la aplicación usando la IP pública de su EC2 y el puerto 3000:

```
http://<IP_PUBLICA_DE_TU_EC2>:3000
```

-----

### 📱 Guía de Uso

1.  **Registro de Usuario**
      * Acceda al formulario de registro y complete con un nuevo usuario y contraseña.
      * La aplicación lo dirigirá a la página de **Configuración 2FA**.
2.  **Configuración 2FA**
      * Escanee el **Código QR** o use el Secreto Manual en su aplicación de autenticación móvil (Google Authenticator).
      * Ingrese el código de 6 dígitos generado en ese momento para **Verificar y Habilitar 2FA**.
3.  **Inicio de Sesión (2 Pasos)**
      * Ingrese su usuario y contraseña en el login.
      * Será redirigido a la página de **Verificación de 2 Factores**.
      * Ingrese el **nuevo código** generado por su aplicación de autenticación para obtener acceso final.

-----

### 📁 Estructura del Proyecto

```
pc4-node-app/
├── .env                      # Variables de entorno (Creado MANUALMENTE en EC2)
├── .gitignore                # Ignora .env y node_modules
├── package.json              # Dependencias de Node.js
├── server.js                 # Aplicación Express principal y rutas
├── db.js                     # Módulo de conexión a PostgreSQL con SSL
├── Dockerfile                # Configuración de la imagen Node.js
├── docker-compose.yml        # Orquestación de contenedores (carga .env)
└── views/                    # Plantillas HTML/EJS y CSS
    ├── style.css             # Estilos mejorados (paleta de colores provista)
    ├── home.html             # Página de bienvenida post-login
    ├── register.html         # Formulario de registro
    ├── login.html            # Formulario de login
    ├── setup_2fa.html        # Muestra el QR code
    └── verify_2fa.html       # Verificación 2FA
```

-----

### 🔧 Configuración de AWS

| Recurso | Configuración |
| :--- | :--- |
| **Base de Datos RDS** | **Motor:** PostgreSQL (Versión 13+), **Puerto:** 5432. |
| **RDS Security Group** | **Regla de Entrada:** Permitir puerto 5432 desde el Grupo de Seguridad de la Instancia EC2. |
| **EC2 Instance** | **AMI:** Ubuntu 20.04 (Corregido), **Tipo:** t2.micro. |
| **EC2 Security Group** | **Regla de Entrada:** Puertos 22 (SSH) y **3000** (Aplicación) abiertos. |

-----

### 🐳 Docker

| Archivo | Función |
| :--- | :--- |
| **Dockerfile** | Utiliza la imagen base `node:18-alpine`. Instala dependencias (`npm install`), copia el código y expone el puerto 3000. |
| **docker-compose.yml** | Define el servicio `web`, mapea el puerto `3000:3000` y utiliza la directiva `env_file: .env` para inyectar de forma segura las credenciales de RDS. |

-----

### 🎥 Video Demostración

  * Link del video en YouTube: https://youtu.be/WtOSF8wmjng
    *(Video de máximo 5 minutos mostrando la configuración de la infraestructura y el funcionamiento de la aplicación containerizada en AWS.)*
