// Ресурс /api/links — створення, перегляд, зміна та видалення коротких посилань.

const express = require('express');
const db = require('../db');
const { HttpError } = require('../errors');
const { checkAllowedFields, validateUrl, validateAlias } = require('../utils/validate');
const { generateCode } = require('../utils/codeGenerator');

const router = express.Router();

// Код помилки PostgreSQL "порушено UNIQUE" (такий code уже є в таблиці)
const UNIQUE_VIOLATION = '23505';
// Скільки разів пробуємо згенерувати новий код, якщо випав уже зайнятий
const MAX_ATTEMPTS = 5;

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

// Додає запис у таблицю. $1, $2 — параметри: pg-promise сам їх безпечно підставить
// (захист від SQL-ін'єкцій).
function insertLink(code, url) {
  return db.one('INSERT INTO links (code, url) VALUES ($1, $2) RETURNING *', [code, url]);
}

// POST /api/links — створити посилання 
router.post('/', async (req, res) => {
  checkAllowedFields(req.body, ['url', 'alias']);
  const url = validateUrl(req.body.url);
  const { alias } = req.body;

  let row;

  if (alias !== undefined) {
    // Користувач запропонував власний код
    validateAlias(alias);
    try {
      row = await insertLink(alias, url);
    } catch (err) {
      if (err.code === UNIQUE_VIOLATION) {
        throw new HttpError(409, `Код "${alias}" уже зайнятий`);
      }
      throw err; // інша помилка бази — віддаємо в errorHandler (500)
    }
  } else {
    // Генеруємо код самі. Якщо випадково збігся з існуючим — пробуємо ще раз.
    for (let attempt = 1; attempt <= MAX_ATTEMPTS && !row; attempt++) {
      try {
        row = await insertLink(generateCode(), url);
      } catch (err) {
        if (err.code !== UNIQUE_VIOLATION) throw err;
      }
    }
    if (!row) {
      throw new Error('Не вдалося згенерувати унікальний код');
    }
  }

  // 201 Created + заголовок Location з адресою нового ресурсу
  res.status(201).location(`/api/links/${row.code}`).json(toLink(row));
});

// PATCH /api/links/:code — змінити оригінальну адресу
router.patch('/:code', async (req, res) => {
  checkAllowedFields(req.body, ['url']);
  const url = validateUrl(req.body.url);

  const row = await db.oneOrNone(
    'UPDATE links SET url = $1 WHERE code = $2 RETURNING *',
    [url, req.params.code]
  );
  if (!row) {
    throw new HttpError(404, `Посилання з кодом "${req.params.code}" не знайдено`);
  }
  res.status(200).json(toLink(row));
});

// DELETE /api/links/:code — видалити посилання
router.delete('/:code', async (req, res) => {
  // result відповідає на питання "скільки рядків видалено"
  const result = await db.result('DELETE FROM links WHERE code = $1', [req.params.code]);
  if (result.rowCount === 0) {
    throw new HttpError(404, `Посилання з кодом "${req.params.code}" не знайдено`);
  }
  // 204 No Content — успіх без тіла відповіді
  res.status(204).end();
});

module.exports = router;