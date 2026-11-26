// Ресурс /api/links — створення, перегляд, зміна та видалення коротких посилань.

const express = require('express');
const db = require('../db');
const { HttpError } = require('../errors');

const router = express.Router();

// Перетворює рядок із таблиці на об'єкт для відповіді (як схема Link в openapi.yaml)
function toLink(row) {
  const baseUrl = process.env.BASE_URL || 'http://localhost:8080';
  return {
    code: row.code,
    url: row.url,
    shortUrl: `${baseUrl}/${row.code}`,
    clicks: row.clicks,
    createdAt: row.created_at,
  };
}

// GET /api/links — усі посилання
router.get('/', async (req, res) => {
  const rows = await db.any('SELECT * FROM links ORDER BY created_at DESC, id DESC');
  res.status(200).json(rows.map(toLink));
});

// GET /api/links/:code — одне посилання
router.get('/:code', async (req, res) => {
  // oneOrNone повертає null, якщо рядка немає (а не кидає помилку)
  const row = await db.oneOrNone('SELECT * FROM links WHERE code = $1', [req.params.code]);
  if (!row) {
    throw new HttpError(404, `Посилання з кодом "${req.params.code}" не знайдено`);
  }
  res.status(200).json(toLink(row));
});

module.exports = router;