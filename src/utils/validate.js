// Перевірка вхідних даних від клієнта.

const { HttpError } = require('../errors');

// Формат alias: латинські літери, цифри, "_" та "-", від 3 до 30 символів
const ALIAS_REGEX = /^[A-Za-z0-9_-]{3,30}$/;

// Слова, які не можуть бути кодами, бо це шляхи самого сервера.
// Порівнюємо без урахування регістру, бо маршрути Express за замовчуванням нечутливі до регістру.
const RESERVED = ['api', 'docs'];

const MAX_URL_LENGTH = 2048;

// Перевіряє, що в тілі запиту лише дозволені поля.
// Так клієнт не зможе "підсунути" code, clicks чи createdAt.
function checkAllowedFields(body, allowed) {
  // Якщо тіла немає або це не об'єкт (наприклад, масив) — це помилка клієнта
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Тіло запиту має бути JSON-об\'єктом (Content-Type: application/json)');
  }
  for (const key of Object.keys(body)) {
    if (!allowed.includes(key)) {
      throw new HttpError(400, `Поле "${key}" не можна передавати. Дозволені поля: ${allowed.join(', ')}`);
    }
  }
}

// Перевіряє довгу адресу і повертає її в нормалізованому вигляді
function validateUrl(url) {
  if (typeof url !== 'string' || url.trim() === '') {
    throw new HttpError(400, 'Поле url є обов\'язковим і має бути рядком');
  }
  if (url.length > MAX_URL_LENGTH) {
    throw new HttpError(400, `Адреса задовга (максимум ${MAX_URL_LENGTH} символів)`);
  }

  let parsed;
  try {
    // Вбудований клас URL кидає помилку, якщо рядок — не адреса
    parsed = new URL(url.trim());
  } catch {
    throw new HttpError(400, 'Поле url має бути адресою http або https');
  }

  // Дозволяємо лише веб-адреси. javascript:, file:, data: тощо — небезпечні
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new HttpError(400, 'Поле url має бути адресою http або https');
  }

  return parsed.href;
}

// Перевіряє alias, запропонований користувачем
function validateAlias(alias) {
  if (typeof alias !== 'string' || !ALIAS_REGEX.test(alias)) {
    throw new HttpError(400, 'alias має містити 3–30 символів: латинські літери, цифри, "_" або "-"');
  }
  if (RESERVED.includes(alias.toLowerCase())) {
    throw new HttpError(400, `alias "${alias}" зарезервований сервером`);
  }
}

module.exports = { checkAllowedFields, validateUrl, validateAlias };