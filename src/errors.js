// Клас помилки з HTTP-кодом. Кидаємо її в обробниках: throw new HttpError(404, ...)
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Відповідність HTTP-коду і машинно-читабельного типу помилки (як у openapi.yaml)
const ERROR_TYPES = {
  400: 'BAD_REQUEST',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
};

// Middleware для помилок — має РІВНО 4 параметри, саме так Express його розпізнає.
// У Express 5 помилка з async-обробника (відхилений проміс) потрапляє сюди автоматично.
function errorHandler(err, req, res, next) {
  // express.json() не зміг розібрати тіло — клієнт надіслав зламаний JSON
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'Тіло запиту не є коректним JSON' });
  }

  // Наша "очікувана" помилка
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: ERROR_TYPES[err.status], message: err.message });
  }

  // Будь-що інше — непередбачена помилка сервера. Деталі пишемо в лог, а не клієнту.
  console.error(err);
  res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Внутрішня помилка сервера' });
}

module.exports = { HttpError, errorHandler };