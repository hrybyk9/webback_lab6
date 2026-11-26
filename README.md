# webback_lab6 — сервіс скорочення посилань (Express.js)

Сервіс перетворює довгу адресу на коротку (`http://localhost:8080/aB3xK9`),
перенаправляє за нею і рахує переходи. API описане в `openapi.yaml` (design-first).

Технології: Node.js, Express 5, pg-promise, PostgreSQL 17, Docker Compose, Swagger UI.

## Запуск

```bash
git clone https://github.com/hrybyk9/webback_lab6.git
cd webback_lab6
cp .env.sample .env        # у .env змініть POSTGRES_PASSWORD
docker compose up --build
```

- Swagger UI: http://localhost:8080/docs
- Health check: http://localhost:8080/api/health

Зупинка: `docker compose down` (дані зберігаються в томі `pgdata`).

## Операції API

| Метод  | Шлях                | Дія                        | Коди          |
|--------|---------------------|----------------------------|---------------|
| GET    | /api/health         | стан сервера і БД          | 200, 503      |
| GET    | /api/links          | усі посилання              | 200           |
| POST   | /api/links          | створити посилання         | 201, 400, 409 |
| GET    | /api/links/{code}   | одне посилання             | 200, 404      |
| PATCH  | /api/links/{code}   | змінити оригінальну адресу | 200, 400, 404 |
| DELETE | /api/links/{code}   | видалити посилання         | 204, 404      |
| GET    | /{code}             | перехід (+1 до лічильника) | 302, 404      |