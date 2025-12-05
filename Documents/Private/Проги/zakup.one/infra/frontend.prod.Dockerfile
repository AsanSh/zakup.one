FROM node:20-slim as builder

WORKDIR /app

# Копирование package.json и установка зависимостей
COPY frontend/package*.json ./
RUN npm install

# Копирование проекта
COPY frontend/ .

# Сборка приложения
# Явно задаем пустую строку для VITE_API_URL в production
ARG VITE_API_URL=""
ENV VITE_API_URL=""
RUN VITE_API_URL="" npm run build

# Production stage - nginx для раздачи статики
FROM nginx:alpine

# Копирование собранных файлов
COPY --from=builder /app/dist /usr/share/nginx/html

# Настройка Nginx для SPA (Single Page Application)
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /assets/ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

