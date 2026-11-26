// Налаштування застосунку Express: middleware і маршрути.
// ПОРЯДОК реєстрації важливий: Express перевіряє middleware зверху вниз.

const express = require('express');

const healthRouter = require('./routes/health');
const { errorHandler } = require('./errors');

const app = express();

// 1. Розбір JSON у тілі запиту -> req.body
//    (спрацьовує лише для запитів із Content-Type: application/json)
app.use(express.json());

// 2. API
app.use('/api/health', healthRouter);

// Обробник помилок — завжди в самому кінці
app.use(errorHandler);

module.exports = app;