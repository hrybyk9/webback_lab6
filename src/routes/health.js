// GET /api/health — перевіряє, що сервер живий і база даних відповідає.

const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Найпростіший запит до бази. Якщо база впала — тут буде виняток.
    await db.one('SELECT 1');
    res.status(200).json({ status: 'ok', database: 'ok' });
  } catch (err) {
    console.error('База даних недоступна:', err.message);
    // 503 Service Unavailable — сервер є, але працювати повноцінно не може
    res.status(503).json({ status: 'error', database: 'unavailable' });
  }
});

module.exports = router;