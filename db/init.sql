-- Скрипт ініціалізації бази даних.
-- Виконується контейнером PostgreSQL ЛИШЕ ОДИН РАЗ — під час першого запуску,
-- коли том (volume) з даними ще порожній.

CREATE TABLE IF NOT EXISTS links (
    -- Внутрішній ідентифікатор запису (назовні не показується)
    id          SERIAL PRIMARY KEY,

    -- Короткий код: або згенерований сервером, або alias користувача.
    -- UNIQUE гарантує, що двох однакових кодів у базі не буде навіть
    -- якщо два запити прийдуть одночасно.
    code        VARCHAR(30) NOT NULL UNIQUE
                CHECK (code ~ '^[A-Za-z0-9_-]{3,30}$'),

    -- Оригінальна (довга) адреса
    url         TEXT NOT NULL
                CHECK (length(url) <= 2048),

    -- Лічильник переходів; від'ємним бути не може
    clicks      INTEGER NOT NULL DEFAULT 0
                CHECK (clicks >= 0),

    -- Дата створення заповнюється автоматично базою
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);