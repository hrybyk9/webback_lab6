// Налаштування застосунку Express: middleware, маршрути, документація.
// ПОРЯДОК реєстрації важливий: Express перевіряє middleware зверху вниз.

const fs = require('fs');
const path = require('path');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');

const healthRouter = require('./routes/health');
const linksRouter = require('./routes/links');
const redirectRouter = require('./routes/redirect');
const { HttpError, errorHandler } = require('./errors');

const app = express();

// 1. Розбір JSON у тілі запиту -> req.body
//    (спрацьовує лише для запитів із Content-Type: application/json)
app.use(express.json());

// 2. API
app.use('/api/health', healthRouter);
app.use('/api/links', linksRouter);

// 3. Swagger UI. Специфікацію читаємо з openapi.yaml під час запуску —
//    це єдине джерело правди, у коді вона не дублюється.
const openapiPath = path.join(__dirname, '..', 'openapi.yaml');
const openapiDocument = YAML.parse(fs.readFileSync(openapiPath, 'utf8'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

// 4. Перехід за коротким посиланням — ОСТАННІМ, щоб /api і /docs
//    не сприймалися як короткі коди
app.use('/', redirectRouter);

// 5. Якщо жоден маршрут не підійшов — 404 у нашому форматі
app.use((req, res, next) => {
  next(new HttpError(404, `Шлях ${req.method} ${req.path} не існує`));
});

// 6. Обробник помилок — завжди в самому кінці
app.use(errorHandler);

module.exports = app;