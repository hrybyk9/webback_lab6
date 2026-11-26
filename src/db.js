// Підключення до PostgreSQL через пакет pg-promise.
// Цей модуль створює ОДИН об'єкт db на весь застосунок (пул з'єднань).

const pgp = require('pg-promise')();

// Параметри підключення беремо зі змінних середовища (.env / compose.yaml).
// Пароль у коді НЕ пишемо.
const db = pgp({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  // Якщо база недоступна — не чекаємо вічно, а через 3 с отримуємо помилку
  connectionTimeoutMillis: 3000,
});

module.exports = db;