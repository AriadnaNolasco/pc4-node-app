Práctica 4 - Sistema de Autenticación 2FA
Soluciones en la Nube - Tecsup👤 
📋 Descripción del ProyectoSistema de autenticación web con verificación de dos pasos (2FA) utilizando Google Authenticator (TOTP). La aplicación está desarrollada con el framework Express.js en Node.js, utiliza PostgreSQL en AWS RDS y está completamente containerizada con Docker.✨ Características Principales✅ Registro de usuarios con generación de Código QR (TOTP)✅ Autenticación de 2 Factores (2FA) obligatoria usando Speakeasy y la app Google Authenticator.✅ Inicio de sesión seguro con contraseña y validación de token 2FA.✅ Base de datos PostgreSQL alojada en AWS RDS.✅ Interfaz moderna utilizando CSS personalizado (basado en la paleta de colores provista) y Font Awesome.✅ Containerización con Docker y orquestación con Docker Compose.✅ Infraestructura como Código (IaC) desplegada en AWS con CloudFormation.🛠️ Tecnologías UtilizadasComponenteTecnologíaBackendExpress.js (Node.js 18-alpine)Base de DatosPostgreSQL (AWS RDS)Autenticación 2FASpeakeasy (TOTP) + QRCodeFrontendHTML5, CSS3, EJS, Font AwesomeContainerizaciónDocker + Docker ComposeIaCAWS CloudFormationCloud ProviderAmazon Web Services (AWS)📦 Requisitos PreviosDocker y Docker Compose (instalados en la instancia EC2).Cuenta de AWS con RDS y EC2 configurados.Google Authenticator (o similar app de TOTP móvil).URL del repositorio Git.🚀 Instalación y Ejecución (Despliegue en AWS EC2)La aplicación está diseñada para ser desplegada en la instancia Ubuntu 20 creada con CloudFormation.1. Configuración de AWSAsegúrese de que la pila de CloudFormation para la instancia EC2 y la instancia RDS PostgreSQL estén en estado CREATE_COMPLETE o Disponible.2. Conexión y ClonaciónConéctese a su instancia EC2 vía SSH y clone el repositorio:Bash# Ejemplo de conexión SSH
ssh -i "pc4-key.pem" ubuntu@<IP_PUBLICA_EC2>

# Clonar el repositorio
git clone <URL_DE_TU_REPOSITORIO>
cd pc4-node-app
3. Configurar Variables de Entorno (Seguridad)IMPORTANTE: Las credenciales de RDS (Host, Usuario, Contraseña) NO se suben a Git. Docker Compose las cargará desde un archivo .env que debe crear manualmente en la EC2.Cree el archivo .env en la carpeta raíz del proyecto y complete con sus datos de RDS:Bashnano .env 
Contenido del archivo .env:Fragmento de código# --- CREDENCIALES DE RDS ---
DATABASE_HOST=dbpc4.clwyuok6o9xr.us-east-2.rds.amazonaws.com 
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=Tecsup2025
DATABASE_NAME=postgres # Nombre de la BD por defecto en RDS
# --- SECRETO DE SESIÓN ---
PORT=3000
SESSION_SECRET=UNA_CADENA_LARGA_SECRETA_Y_ALEATORIA
(Guarde y salga de nano: Ctrl+X, Y, Enter)4. Ejecutar el Despliegue con Docker ComposeEjecute el siguiente comando para construir la imagen de Node.js, instalar dependencias y levantar el contenedor en el puerto 3000:Bashsudo docker-compose up -d --build
5. Acceder a la AplicaciónVerifique que el contenedor esté activo:Bashsudo docker ps
Abra el navegador y acceda a la aplicación usando la IP pública de su EC2 y el puerto 3000:http://<IP_PUBLICA_DE_TU_EC2>:3000
📱 Guía de UsoRegistro de UsuarioAcceda al formulario de registro y complete con un nuevo usuario y contraseña.La aplicación lo dirigirá a la página de Configuración 2FA.Configuración 2FAEscanee el Código QR o use el Secreto Manual en su aplicación de autenticación móvil (Google Authenticator).Ingrese el código de 6 dígitos generado en ese momento para Verificar y Habilitar 2FA.Inicio de Sesión (2 Pasos)Ingrese su usuario y contraseña en el login.Será redirigido a la página de Verificación de 2 Factores.Ingrese el nuevo código generado por su aplicación de autenticación para obtener acceso final.📁 Estructura del Proyectopc4-node-app/
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
🔧 Configuración de AWSRecursoConfiguraciónBase de Datos RDSMotor: PostgreSQL (Versión 13+), Puerto: 5432.RDS Security GroupRegla de Entrada: Permitir puerto 5432 desde el Grupo de Seguridad de la Instancia EC2.EC2 InstanceAMI: Ubuntu 20.04 (Corregido), Tipo: t2.micro.EC2 Security GroupRegla de Entrada: Puertos 22 (SSH) y 3000 (Aplicación) abiertos.🐳 DockerArchivoFunciónDockerfileUtiliza la imagen base node:18-alpine. Instala dependencias (npm install), copia el código y expone el puerto 3000.docker-compose.ymlDefine el servicio web, mapea el puerto 3000:3000 y utiliza la directiva env_file: .env para inyectar de forma segura las credenciales de RDS.🎥 Video DemostraciónLink del video: [Enlace de Drive]Link del video en YouTube: [Enlace de YouTube](Video de máximo 5 minutos mostrando la configuración de la infraestructura y el funcionamiento de la aplicación containerizada en AWS.)
