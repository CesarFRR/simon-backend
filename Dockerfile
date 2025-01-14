# Usar una imagen base oficial de Node.js (versión 22)
FROM node:22

# Establecer el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copiar el archivo package.json y package-lock.json (si existe)
COPY package*.json ./

# Instalar las dependencias del proyecto
RUN npm install

# Copiar el resto del código de la aplicación
COPY . .

# Exponer el puerto en el que la aplicación se ejecutará
EXPOSE 5000

# Definir el comando para ejecutar la aplicación
CMD ["npm", "start"]