# Romanov Records

Сайт и админ-панель студии Romanov Records.

## Локальный запуск

```bash
cp .env.example .env
make up-build
```

Фронтенд: http://localhost:3000  
Backend API: http://localhost:8080/api/v1

## Переменные окружения

Перед продакшен-деплоем обязательно заменить значения в `.env`:

- `POSTGRES_PASSWORD` — сильный пароль базы.
- `ADMIN_SESSION_SECRET` — случайная строка минимум 32 символа.
- `HTTP_CORS_ORIGIN` — публичный URL сайта, например `https://romanovrecords.ru`.
- `NEXT_PUBLIC_SITE_URL` — тот же публичный URL сайта.
- `TELEGRAM_BOT_TOKEN` и `TELEGRAM_NOTIFY_CHAT_IDS` — опционально, для уведомлений.
- `TELEGRAM_API_BASE_URL` — опционально, URL Telegram relay, например Cloudflare Worker.
- `TELEGRAM_RELAY_SECRET` — опционально, общий секрет для защищенного Telegram relay.
- `HTTPS_PROXY` — опционально, HTTP/HTTPS-прокси для backend, если сервер не может достучаться до Telegram API.

## Деплой

На сервере:

```bash
git pull --ff-only
cp .env.example .env
# отредактировать .env
make deploy
```

Backend в `docker-compose.yaml` публикуется только на `127.0.0.1:8080`; наружу обычно открывается только фронтенд или reverse proxy на `80/443`.

## Админ

Создать или обновить администратора:

```bash
make admin-create login=admin password='strong-password'
```

Сгенерировать bcrypt-хеш вручную:

```bash
make admin-hash password='strong-password'
```

## Telegram через прокси

Если хостинг не открывает `https://api.telegram.org`, укажи в `.env` прокси для backend:

```env
HTTPS_PROXY=http://user:password@proxy.example.com:3128
HTTP_PROXY=http://user:password@proxy.example.com:3128
NO_PROXY=localhost,127.0.0.1,romanov-postgres,romanov-backend,romanov-frontend
```

После изменения:

```bash
docker compose up -d --force-recreate romanov-backend
```

## Telegram через Cloudflare Worker

Бесплатная альтернатива прокси: создать Cloudflare Worker с кодом из
`ops/cloudflare/telegram-worker.js`. Worker должен быть доступен по публичному
URL вида `https://romanov-telegram-relay.<account>.workers.dev`.

На сервере в `.env`:

```env
TELEGRAM_API_BASE_URL=https://romanov-telegram-relay.<account>.workers.dev
TELEGRAM_RELAY_SECRET=значение_из_openssl_rand_hex_32
```

В настройках Worker добавь переменную `RELAY_SECRET` с тем же значением.

Проверка с сервера:

```bash
set -a
. ./.env
set +a
curl -sS -H "X-Romanov-Relay-Secret: ${TELEGRAM_RELAY_SECRET}" "${TELEGRAM_API_BASE_URL}/bot${TELEGRAM_BOT_TOKEN}/getMe"
docker compose up -d --build --force-recreate romanov-backend
```
