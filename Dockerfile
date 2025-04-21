# Etapa 1 - build Angular
FROM node:22.14.0-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build --configuration=production

# Etapa 2 - nginx para servir a app
FROM nginx:alpine

COPY --from=build /app/dist/device-manager-frontend/browser /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
