import { redirect } from "next/navigation";
import { getBookings, logoutAction, refreshAction, updateStatusAction, type Booking } from "./actions";

const TEAL = "#1db8a6";

const STATUS_ORDER: Record<string, number> = {
  new:       0,
  confirmed: 1,
  completed: 2,
  cancelled: 3,
};

const STATUS_LABEL: Record<string, string> = {
  new:       "Новая",
  confirmed: "Согласовано",
  completed: "Выполнено",
  cancelled: "Отменено",
};

const STATUS_COLOR: Record<string, { bg: string; border: string; text: string }> = {
  new:       { bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.4)",  text: "#fbbf24" },
  confirmed: { bg: "rgba(29,184,166,0.12)",  border: "rgba(29,184,166,0.4)",  text: TEAL },
  completed: { bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.2)", text: "rgba(255,255,255,0.45)" },
  cancelled: { bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.25)", text: "#f87171" },
};

function sortBookings(list: Booking[]): Booking[] {
  return [...list].sort((a, b) => {
    const od = (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
    if (od !== 0) return od;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function fmtTime(iso: string): string {
  const m = iso.match(/T(\d{2}:\d{2})/);
  return m ? m[1] : iso;
}

const contact: React.CSSProperties = {
  fontFamily: '"BerlinType", sans-serif',
  color: "rgba(255,255,255,0.6)",
  fontSize: "0.88rem",
};

function StatusBtn({
  bookingId,
  newStatus,
  label,
  color,
}: {
  bookingId: number;
  newStatus: string;
  label: string;
  color: string;
}) {
  return (
    <form action={updateStatusAction} style={{ display: "inline" }}>
      <input type="hidden" name="id"     value={bookingId} />
      <input type="hidden" name="status" value={newStatus} />
      <button
        type="submit"
        style={{
          background: "none",
          border: `1px solid ${color}`,
          borderRadius: 8,
          color,
          fontFamily: '"BerlinType", sans-serif',
          fontSize: "0.78rem",
          padding: "6px 12px",
          cursor: "pointer",
          whiteSpace: "nowrap",
          textAlign: "center",
          width: "100%",
        }}
      >
        {label}
      </button>
    </form>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  const sc = STATUS_COLOR[booking.status] ?? STATUS_COLOR.completed;
  return (
    <div
      style={{
        background: "rgba(7,56,53,0.7)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: "1.25rem 1.5rem",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: "0.75rem",
        alignItems: "start",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <span style={{ fontFamily: '"Borsok", sans-serif', color: "#fff", fontSize: "1rem", letterSpacing: "0.03em" }}>
            {booking.full_name}
          </span>
          <span
            style={{
              background: sc.bg,
              border: `1px solid ${sc.border}`,
              borderRadius: 999,
              color: sc.text,
              fontSize: "0.7rem",
              fontFamily: '"BerlinType", sans-serif',
              padding: "2px 10px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            {STATUS_LABEL[booking.status] ?? booking.status}
          </span>
        </div>

        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          <span style={contact}>{booking.phone_number}</span>
          {booking.telegram_username && <span style={contact}>{booking.telegram_username}</span>}
        </div>

        {booking.desired_date.startsWith("1970") ? (
          <div>
            <span style={{
              ...contact,
              background: "rgba(29,184,166,0.12)",
              border: "1px solid rgba(29,184,166,0.35)",
              color: TEAL,
              padding: "2px 10px",
              borderRadius: 999,
              fontSize: "0.78rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}>
              Без записи в студии
            </span>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <span style={{ ...contact, color: TEAL }}>{fmtDate(booking.desired_date)}</span>
            <span style={{ ...contact, color: TEAL }}>{fmtTime(booking.desired_time)} · {booking.duration_hours} ч.</span>
          </div>
        )}

        {booking.request_details && (
          <p style={{ ...contact, color: "rgba(255,255,255,0.65)", margin: 0 }}>{booking.request_details}</p>
        )}

        {booking.comment && (
          <p style={{ ...contact, color: "rgba(255,255,255,0.4)", fontStyle: "italic", margin: 0 }}>{booking.comment}</p>
        )}

        <p style={{ ...contact, color: "rgba(255,255,255,0.25)", fontSize: "0.72rem", margin: 0 }}>
          Заявка от {fmtDate(booking.created_at)}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", minWidth: 120 }}>
        {booking.status === "new" && (
          <>
            <StatusBtn bookingId={booking.id} newStatus="confirmed" label="Согласовать" color={TEAL} />
            <StatusBtn bookingId={booking.id} newStatus="cancelled" label="Отменить" color="rgba(248,113,113,0.65)" />
          </>
        )}
        {booking.status === "confirmed" && (
          <>
            <StatusBtn bookingId={booking.id} newStatus="completed" label="Выполнено" color="rgba(255,255,255,0.35)" />
            <StatusBtn bookingId={booking.id} newStatus="cancelled" label="Отменить" color="rgba(248,113,113,0.65)" />
          </>
        )}
        {booking.status === "completed" && (
          <StatusBtn bookingId={booking.id} newStatus="new" label="Вернуть" color="rgba(255,100,100,0.6)" />
        )}
        {booking.status === "cancelled" && (
          <StatusBtn bookingId={booking.id} newStatus="new" label="Восстановить" color={TEAL} />
        )}
      </div>
    </div>
  );
}

function Section({
  title, count, accent, children,
}: { title: string; count: number; accent: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.85rem" }}>
        <div style={{ width: 3, height: 18, borderRadius: 2, background: accent, flexShrink: 0 }} />
        <span style={{ fontFamily: '"Borsok", sans-serif', color: "#fff", fontSize: "0.95rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
          {title}
        </span>
        <span style={{ fontFamily: '"BerlinType", sans-serif', color: "rgba(255,255,255,0.3)", fontSize: "0.8rem" }}>
          {count}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>{children}</div>
    </div>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const result = await getBookings();

  if (result === "unauthorized") {
    redirect("/admin/login");
  }

  const isError = result === "error";
  const bookings = isError ? [] : sortBookings(result);
  const byStatus = (s: Booking["status"]) => bookings.filter(b => b.status === s);

  return (
    <div style={{ minHeight: "100vh", padding: "2rem 1.5rem", maxWidth: 900, margin: "0 auto" }}>
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: "2rem", flexWrap: "wrap", gap: "1rem",
        }}
      >
        <div>
          <h1 style={{
            fontFamily: '"Borsok", sans-serif', color: "#fff",
            fontSize: "clamp(1.4rem, 4vw, 2rem)", letterSpacing: "0.06em",
            textTransform: "uppercase", margin: 0,
          }}>
            Записи
          </h1>
          <p style={{
            fontFamily: '"BerlinType", sans-serif',
            color: "rgba(255,255,255,0.35)",
            fontSize: "0.82rem",
            margin: "0.25rem 0 0",
          }}>
            {bookings.length} заявок · Romanov Records
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <form action={refreshAction} style={{ display: "inline" }}>
            <button
              type="submit"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 10,
                color: "#fff",
                fontFamily: '"BerlinType", sans-serif',
                fontSize: "0.85rem",
                padding: "8px 16px",
                cursor: "pointer",
              }}
            >
              Обновить
            </button>
          </form>
          <form action={logoutAction} style={{ display: "inline" }}>
            <button
              type="submit"
              style={{
                background: "none",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 10,
                color: "rgba(255,255,255,0.5)",
                fontFamily: '"BerlinType", sans-serif',
                fontSize: "0.85rem",
                padding: "8px 16px",
                cursor: "pointer",
              }}
            >
              Выйти
            </button>
          </form>
        </div>
      </div>

      {params.error && (
        <p
          role="alert"
          style={{
            background: "rgba(248,113,113,0.08)",
            border: "1px solid rgba(248,113,113,0.25)",
            borderRadius: 10,
            color: "#f87171",
            fontFamily: '"BerlinType", sans-serif',
            margin: "0 0 1.5rem",
            padding: "0.75rem 1rem",
          }}
        >
          {params.error === "conflict"
            ? "Не удалось восстановить заявку: её время уже занято."
            : "Не удалось изменить статус заявки. Попробуйте ещё раз."}
        </p>
      )}

      {isError && (
        <p style={{
          fontFamily: '"BerlinType", sans-serif',
          color: "#f87171", textAlign: "center", paddingTop: "2rem",
        }}>
          Не удалось загрузить заявки. Попробуйте обновить.
        </p>
      )}

      {!isError && bookings.length === 0 && (
        <p style={{
          fontFamily: '"BerlinType", sans-serif',
          color: "rgba(255,255,255,0.4)", textAlign: "center", paddingTop: "4rem",
        }}>
          Заявок пока нет
        </p>
      )}

      {!isError && bookings.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {byStatus("new").length > 0 && (
            <Section title="Новые" count={byStatus("new").length} accent="#fbbf24">
              {byStatus("new").map(b => <BookingCard key={b.id} booking={b} />)}
            </Section>
          )}
          {byStatus("confirmed").length > 0 && (
            <Section title="Согласовано" count={byStatus("confirmed").length} accent={TEAL}>
              {byStatus("confirmed").map(b => <BookingCard key={b.id} booking={b} />)}
            </Section>
          )}
          {byStatus("completed").length > 0 && (
            <Section title="Выполнено" count={byStatus("completed").length} accent="rgba(255,255,255,0.3)">
              {byStatus("completed").map(b => <BookingCard key={b.id} booking={b} />)}
            </Section>
          )}
          {byStatus("cancelled").length > 0 && (
            <Section title="Отменено" count={byStatus("cancelled").length} accent="#f87171">
              {byStatus("cancelled").map(b => <BookingCard key={b.id} booking={b} />)}
            </Section>
          )}
        </div>
      )}
    </div>
  );
}
