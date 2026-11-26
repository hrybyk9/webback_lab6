# Базовий образ — Node.js 24 (LTS) на легкому Alpine Linux
FROM node:24-alpine

# Робоча папка всередині контейнера
WORKDIR /app

# Спочатку копіюємо лише package*.json і ставимо залежності.
# Так Docker кешує цей шар і не перевстановлює пакети, якщо змінився лише код.
COPY package*.json ./
RUN npm ci --omit=dev

# Тепер копіюємо решту проєкту (крім того, що в .dockerignore)
COPY . .

# Документуємо, що застосунок слухає порт 8080
EXPOSE 8080

# Команда запуску сервера
CMD ["node", "src/server.js"]