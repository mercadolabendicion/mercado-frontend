# Etapa 1: Construcción
FROM node:18-alpine as build

# Configura el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de configuración necesarios y las dependencias
COPY package.json package-lock.json ./

# Instala las dependencias de Node.js
RUN npm install

# Copia el resto de los archivos del proyecto
COPY . .

# Construye la aplicación Angular
RUN npm run build -- facturacion --base-href=/

# Etapa 2: Servidor web (Nginx)
FROM nginx:1.25-alpine

# Copia los archivos de construcción desde la etapa anterior
COPY --from=build /app/dist/facturacion /usr/share/nginx/html

# Copia un archivo de configuración personalizado para Nginx (opcional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expone el puerto en el que correrá la aplicación
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
