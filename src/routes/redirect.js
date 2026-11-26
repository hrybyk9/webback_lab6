// GET /:code — перехід за коротким посиланням.

const express = require('express');
const db = require('../db');
const { HttpError } = require('../errors');

const router = express.Router();

router.get('/:code', async (req, res) => {
  // Одним запитом і збільшуємо лічильник, і отримуємо адресу.
  // clicks = clicks + 1 виконується атомарно в базі, тому одночасні переходи не "загубляться".
  const row = await db.oneOrNone(
    'UPDATE links SET clicks = clicks + 1 WHERE code = $1 RETURNING url',
    [req.params.code]
  );
  if (!row) {
    throw new HttpError(404, `Посилання з кодом "${req.params.code}" не знайдено`);
  }
  // 302 Found — тимчасове перенаправлення, браузер не кешує його,
  // тому кожен наступний перехід знову прийде на сервер і буде підрахований
  res.redirect(302, row.url);
});

module.exports = router;