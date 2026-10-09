DROP INDEX IF EXISTS romanov.bookings_created_at_idx;

ALTER TABLE romanov.bookings
    DROP CONSTRAINT IF EXISTS bookings_no_overlapping_times,
    DROP CONSTRAINT IF EXISTS bookings_duration_hours_check,
    DROP CONSTRAINT IF EXISTS bookings_status_check;

UPDATE romanov.bookings SET status = 'Согласовано' WHERE status = 'confirmed';
UPDATE romanov.bookings SET status = 'Выполнено' WHERE status = 'completed';
UPDATE romanov.bookings SET status = 'new' WHERE status = 'cancelled';
