// Точка входу: завантажуємо налаштування і запускаємо сервер.

// dotenv читає файл .env (якщо він є) і кладе значення в process.env.
// У Docker змінні передає compose.yaml, тому файлу .env у контейнері немає — і це нормально.
require('dotenv').config({ quiet: true }); // quiet — без зайвих повідомлень у консолі

const app = require('./app');

const PORT = Number(process.env.PORT) || 8080;

app.listen(PORT, () => {
  console.log(`Сервер запущено: http://localhost:${PORT}`);
  console.log(`Документація Swagger UI: http://localhost:${PORT}/docs`);
});