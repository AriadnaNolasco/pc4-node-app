# Usa la imagen base de Node.js
FROM node:18-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de manifiesto e instala dependencias
COPY package.json package-lock.json ./
RUN npm install

# Copia el código fuente de la aplicación (incluye server.js, db.js y views/)
COPY . .

# Expone el puerto 3000
EXPOSE 3000

# Comando para iniciar el servidor
CMD ["npm", "start"]