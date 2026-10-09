# Deployment runbook

## Production assumptions

- Linux host with Docker Engine, Compose v2, Git and a reverse proxy;
- DNS and TLS configured outside this repository;
- only ports `80/443` are public;
- application files live in a dedicated non-root service account;
- PostgreSQL data and backups are stored outside the Git checkout.

The Compose file publishes the Go API only on `127.0.0.1`. The frontend can be
published directly or reached through the reverse proxy.

## First deployment

```bash
git clone https://github.com/woka00/romanov-records.git
cd romanov-records
cp .env.example .env
openssl rand -hex 32
```

Place the generated value in `ADMIN_SESSION_SECRET`, replace all database
credentials and set the canonical public URL. Then run:

```bash
make up-build
docker compose ps
curl --fail http://127.0.0.1:8080/readyz
make admin-create
```

## Routine release

```bash
git pull --ff-only
docker compose config --quiet
docker compose up -d --build
docker compose ps
```

`romanov-migrate` applies pending migrations before the API is replaced. Always
review migration SQL and take a backup before a production schema change.

Before deploying migration `000003_booking_integrity`, check whether legacy data
already contains overlapping active bookings:

```sql
SELECT a.id, b.id, a.desired_date
FROM romanov.bookings a
JOIN romanov.bookings b ON a.id < b.id
WHERE a.status <> 'cancelled'
  AND b.status <> 'cancelled'
  AND a.desired_date > DATE '1970-01-01'
  AND tsrange(
        a.desired_date + a.desired_time,
        a.desired_date + a.desired_time + a.duration_hours * INTERVAL '1 hour',
        '[)'
      ) && tsrange(
        b.desired_date + b.desired_time,
        b.desired_date + b.desired_time + b.duration_hours * INTERVAL '1 hour',
        '[)'
      );
```

Resolve any returned records with studio staff before applying the constraint.

## Backup and restore

Create an encrypted, access-controlled backup directory outside the repository.
A logical backup can then be produced with:

```bash
docker compose exec -T romanov-postgres sh -c \
  'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom' \
  > /secure/backups/romanov-$(date +%F-%H%M).dump
```

Periodically verify backups by restoring into an isolated database. Never test a
restore against production:

```bash
createdb romanov_restore_test
pg_restore --exit-on-error --clean --if-exists \
  --dbname=romanov_restore_test /secure/backups/romanov-YYYY-MM-DD-HHMM.dump
```

Retention, encryption and off-host replication depend on the hosting provider;
document them alongside the server configuration.

## Telegram relay

If the host cannot reach `api.telegram.org`, deploy
`ops/cloudflare/telegram-worker.js` as a Cloudflare Worker. Configure a random
`RELAY_SECRET` in the Worker and the same value as `TELEGRAM_RELAY_SECRET` in
the application environment:

```env
TELEGRAM_API_BASE_URL=https://romanov-telegram-relay.example.workers.dev
TELEGRAM_RELAY_SECRET=<random-64-character-hex-value>
```

The Worker accepts only `/bot...` paths and requires the shared secret header.
The bot token is still supplied by the backend and must never be stored in the
Worker source.

An HTTPS-capable outbound proxy can be used instead through `HTTPS_PROXY`. Keep
internal service names in `NO_PROXY`.

## Incident checks

```bash
docker compose ps
docker compose logs --since=30m romanov-backend
curl --fail http://127.0.0.1:8080/healthz
curl --fail http://127.0.0.1:8080/readyz
```

Structured backend logs include request ID, method, path, status and duration.
Use the request ID to correlate a client failure with a server-side error.
