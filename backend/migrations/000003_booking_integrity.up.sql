UPDATE romanov.bookings SET status = 'confirmed' WHERE status = 'Согласовано';
UPDATE romanov.bookings SET status = 'completed' WHERE status = 'Выполнено';

ALTER TABLE romanov.bookings
    ADD CONSTRAINT bookings_status_check
    CHECK (status IN ('new', 'confirmed', 'completed', 'cancelled'));

ALTER TABLE romanov.bookings
    ADD CONSTRAINT bookings_duration_hours_check
    CHECK (duration_hours BETWEEN 1 AND 24);

-- PostgreSQL enforces the scheduling invariant atomically. A UI availability
-- check alone cannot prevent two concurrent requests from taking the same slot.
ALTER TABLE romanov.bookings
    ADD CONSTRAINT bookings_no_overlapping_times
    EXCLUDE USING gist (
        tsrange(
            desired_date + desired_time,
            desired_date + desired_time + duration_hours * INTERVAL '1 hour',
            '[)'
        ) WITH &&
    )
    WHERE (status <> 'cancelled' AND desired_date > DATE '1970-01-01');

CREATE INDEX bookings_created_at_idx
    ON romanov.bookings (created_at DESC);
