include .env
export

.PHONY: up up-build down restart build logs logs-backend logs-frontend ps clean migrate migrate-create deploy config admin-hash admin-create

## Запустить все сервисы
up:
	@docker compose up -d

## Собрать образы и запустить
up-build:
	@docker compose up -d --build

## Остановить все сервисы
down:
	@docker compose down

## Перезапустить все сервисы
restart:
	@docker compose restart

## Собрать Docker-образы
build:
	@docker compose build

## Следить за логами всех сервисов (Ctrl+C для выхода)
logs:
	@docker compose logs -f

## Логи только бэкенда (включая уведомления Telegram)
logs-backend:
	@docker compose logs -f romanov-backend

## Логи только фронтенда
logs-frontend:
	@docker compose logs -f romanov-frontend

## Статус контейнеров
ps:
	@docker compose ps

## Проверить итоговый docker compose config
config:
	@docker compose config >/dev/null
	@echo "docker compose config: OK"

## Полный деплой: pull + build + up + миграции (для сервера)
deploy:
	@git pull --ff-only
	@docker compose config >/dev/null
	@docker compose up -d --build
	@docker compose ps

## Применить миграции вручную
migrate:
	@docker compose run --rm romanov-migrate

## Создать новую миграцию: make migrate-create seq=название
migrate-create:
	@if [ -z "$(seq)" ]; then \
		echo "Укажите имя: make migrate-create seq=название"; exit 1; \
	fi
	@docker run --rm \
		-v $(shell pwd)/backend/migrations:/migrations \
		migrate/migrate:v4.19.1 \
			create -ext sql -dir /migrations -seq "$(seq)"

## Сгенерировать bcrypt-хеш для админа: make admin-hash password='...'
admin-hash:
	@if [ -z "$(password)" ]; then \
		echo "Укажите пароль: make admin-hash password='...'"; exit 1; \
	fi
	@docker run --rm \
		-v $(shell pwd)/backend:/app \
		-w /app \
		golang:1.25-bookworm \
		go run ./cmd/hash-password "$(password)"

## Создать/обновить админа: make admin-create login=admin password='...'
admin-create:
	@if [ -z "$(login)" ] || [ -z "$(password)" ]; then \
		echo "Укажите логин и пароль: make admin-create login=admin password='...'"; exit 1; \
	fi
	@hash=$$(docker run --rm -v $(shell pwd)/backend:/app -w /app golang:1.25-bookworm go run ./cmd/hash-password "$(password)"); \
	docker compose exec -T romanov-postgres psql -U "$$POSTGRES_USER" -d "$$POSTGRES_DB" \
		-c "INSERT INTO romanov.admins (login, password_hash) VALUES ('$(login)', '$$hash') ON CONFLICT (login) DO UPDATE SET password_hash = EXCLUDED.password_hash;"

## Удалить все данные БД (с подтверждением)
clean:
	@read -p "Удалить все данные БД? Это необратимо. [y/N]: " ans; \
	if [ "$$ans" = "y" ]; then \
		docker compose down -v && echo "Данные удалены"; \
	else \
		echo "Отменено"; \
	fi
