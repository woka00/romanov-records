CREATE SCHEMA IF NOT EXISTS romanov;

CREATE TABLE IF NOT EXISTS romanov.bookings (
    id                  BIGSERIAL       PRIMARY KEY,
    full_name           VARCHAR(100)    NOT NULL,
    phone_number        VARCHAR(30)     NOT NULL,
    telegram_username   VARCHAR(150),
    desired_date        DATE            NOT NULL,
    desired_time        TIME            NOT NULL,
    request_details     TEXT            NOT NULL,
    comment             TEXT,
    status              VARCHAR(30)     NOT NULL    DEFAULT 'new',
    created_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS romanov.admins (
    id BIGSERIAL PRIMARY KEY,
    login VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
