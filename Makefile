-include .env
export

.PHONY: up up-build down restart build logs logs-backend logs-frontend ps clean migrate migrate-create deploy config test check integration-test admin-create

GO ?= go

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

## Запустить unit-тесты backend и проверки frontend
test:
	@cd backend && $(GO) test ./...
	@cd frontend && npm run lint

## Полная локальная проверка перед pull request
check:
	@cd backend && $(GO) test -race ./... && $(GO) vet ./...
	@cd frontend && npm audit --omit=dev --audit-level=high && npm run lint && npm run build
	@docker compose config --quiet

## Интеграционные тесты; требуется TEST_DATABASE_URL и применённые миграции
integration-test:
	@cd backend && $(GO) test -tags=integration ./internal/features/bookings/repository

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

## Создать/обновить администратора (логин и пароль запрашиваются интерактивно)
admin-create:
	@admin_login="$${ADMIN_LOGIN:-$(login)}"; \
	admin_password="$${ADMIN_PASSWORD:-$(password)}"; \
	if [ -z "$$admin_login" ]; then read -r -p "Логин администратора: " admin_login; fi; \
	if [ -z "$$admin_password" ]; then read -r -s -p "Пароль (минимум 12 символов): " admin_password; echo; fi; \
	ADMIN_LOGIN="$$admin_login" ADMIN_PASSWORD="$$admin_password" \
		docker compose run --rm --no-deps \
		-e ADMIN_LOGIN -e ADMIN_PASSWORD \
		--entrypoint /admin-create romanov-backend

## Удалить все данные БД (с подтверждением)
clean:
	@read -p "Удалить все данные БД? Это необратимо. [y/N]: " ans; \
	if [ "$$ans" = "y" ]; then \
		docker compose down -v && echo "Данные удалены"; \
	else \
		echo "Отменено"; \
	fi
