// Налаштування застосунку Express: middleware і маршрути.
// ПОРЯДОК реєстрації важливий: Express перевіряє middleware зверху вниз.

const express = require('express');

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

// Перехід за коротким посиланням — ОСТАННІМ серед маршрутів,
// щоб /api не сприймався як короткий код
app.use('/', redirectRouter);

// Якщо жоден маршрут не підійшов — 404 у нашому форматі
app.use((req, res, next) => {
  next(new HttpError(404, `Шлях ${req.method} ${req.path} не існує`));
});

// Обробник помилок — завжди в самому кінці
app.use(errorHandler);

module.exports = app;