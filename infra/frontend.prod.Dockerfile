FROM node:20-slim as builder

WORKDIR /app

# Копирование package.json и установка зависимостей
COPY frontend/package*.json ./
RUN npm install

# Копирование проекта
COPY frontend/ .

# Сборка приложения (используем только vite build, без проверки типов)
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npx vite build --mode production

# Production stage - nginx для раздачи статики
FROM nginx:alpine

# Копирование собранных файлов
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx конфигурация для SPA (чтобы все маршруты работали)
RUN echo 'server {     listen 80;     server_name _;     root /usr/share/nginx/html;     index index.html;     location / {         try_files $uri $uri/ /index.html;     } }' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
