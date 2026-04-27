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
