FROM node:20-slim

WORKDIR /app

# Копирование package.json и установка зависимостей
COPY frontend/package*.json ./
RUN npm install

# Копирование проекта
COPY frontend/ .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]



