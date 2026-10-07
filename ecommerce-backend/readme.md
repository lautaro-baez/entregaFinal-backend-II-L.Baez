# Ecommerce Backend

Proyecto backend para plataforma de e-commerce desarrollado con Node.js, Express y MongoDB Atlas. Cuenta con arquitectura en capas (DAO, Repository, DTO), autenticación JWT y control de acceso basado en roles.

## Requisitos previos

- Node.js (versión 18 o superior)
- npm (incluido con Node.js)
- Cuenta y cluster activo en MongoDB Atlas

## Instalación

1. Clonar el repositorio:
   git clone <URL_DEL_REPOSITORIO>

2. Ingresar al directorio del proyecto:
   cd ecommerce-backend

3. Instalar las dependencias:
   npm install

## Configuración del entorno

Crear un archivo llamado .env en la raíz del proyecto (a la altura de package.json) con las siguientes variables:

PORT=8080
MONGO_URI=mongodb+srv://entregaFinalBackend:1234@cluster0.9blcd30.mongodb.net/?appName=Cluster0 (servicio de ejemplo)
JWT_SECRET=secretoSuperSeguro123
MAILING_USER=tuemail@gmail.com
MAILING_PASSWORD=tu_contraseña_de_aplicacion
APP_URL=http://localhost:8080

## Ejecución del proyecto

### Modo desarrollo (con recarga automática):
npm run dev

### Modo producción:
npm start

El servidor se iniciará en http://localhost:8080 y establecerá la conexión con MongoDB Atlas.