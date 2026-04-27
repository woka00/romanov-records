"use client";
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

const API = "/api/v1";
const TEAL = "#1db8a6";

const RU_MONTHS = [
  "Январь","Февраль","Март","Апрель","Май","Июнь",
  "Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь",
];
const RU_DAYS = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];

const SERVICES = [
  { id: "instruments", label: "Запись инструментов", hasHours: true },
  { id: "vocal",       label: "Запись вокала",       hasHours: true },
  { id: "mixing",      label: "Сведение",             hasHours: false },
  { id: "rental",      label: "Аренда Студии",        hasHours: true },
  { id: "turnkey",     label: "Трек под ключ",        hasHours: false },
];

const TIME_SLOTS: string[] = [];
for (let h = 0; h < 24; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:00`);
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:30`);
}

function isNightSlot(slot: string) {
  const h = parseInt(slot.split(":")[0], 10);
  return h >= 22 || h <= 9;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  );
}

function isSlotDisabled(slot: string, selectedDate: Date | null, busyTimes: string[]) {
  if (busyTimes.includes(slot)) return true;
  if (!selectedDate) return false;
  const now = new Date();
  if (!sameDay(selectedDate, now)) return false;
  const [h, m] = slot.split(":").map(Number);
  const minMs  = now.getTime() + 60 * 60 * 1000;
  const slotMs = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m).getTime();
  return slotMs < minMs;
}

function localDateStr(d: Date) {
  const y  = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

/* ── Встроенный календарь ───────────────────────────────────────── */
function Calendar({
  selected,
  onSelect,
}: {
  selected: Date | null;
  onSelect: (d: Date) => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [view, setView] = useState(() => {
    const d = selected ?? new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const year  = view.getFullYear();
  const month = view.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow    = (new Date(year, month, 1).getDay() + 6) % 7;

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const canPrev =
    new Date(year, month, 1) > new Date(today.getFullYear(), today.getMonth(), 1);

  return (
    <div
      style={{
        marginTop: 8,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 12,
        padding: "0.75rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
        <button
          onClick={() => canPrev && setView(new Date(year, month - 1, 1))}
          style={{
            background: "none", border: "none",
            color: canPrev ? "#fff" : "rgba(255,255,255,0.2)",
            cursor: canPrev ? "pointer" : "default",
            fontSize: 20, padding: "0 8px", lineHeight: 1,
          }}
        >‹</button>
        <span style={{ fontFamily: '"Borsok", sans-serif', color: "#fff", fontSize: "0.85rem", letterSpacing: "0.05em" }}>
          {RU_MONTHS[month]} {year}
        </span>
        <button
          onClick={() => setView(new Date(year, month + 1, 1))}
          style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 20, padding: "0 8px", lineHeight: 1 }}
        >›</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
        {RU_DAYS.map(d => (
          <div key={d} style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: "0.67rem", padding: "2px 0" }}>
            {d}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const date    = new Date(year, month, day);
          const isPast  = date < today;
          const isToday = sameDay(date, today);
          const isSel   = selected ? sameDay(date, selected) : false;
          return (
            <button
              key={i}
              disabled={isPast}
              onClick={() => onSelect(date)}
              style={{
                background: isSel ? TEAL : isToday ? "rgba(29,184,166,0.15)" : "none",
                border: isToday && !isSel ? `1px solid ${TEAL}` : "1px solid transparent",
                borderRadius: 7,
                color: isPast ? "rgba(255,255,255,0.18)" : "#fff",
                cursor: isPast ? "not-allowed" : "pointer",
                padding: "5px 0",
                fontSize: "0.82rem",
                textAlign: "center",
                transition: "background 0.12s",
                fontFamily: '"BerlinType", sans-serif',
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function IconCalendar() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ opacity: 0.45, flexShrink: 0 }}>
      <rect x="1" y="2" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M1 5.5h12" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M4 1v2M10 1v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ opacity: 0.45, flexShrink: 0 }}>
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M7 4v3.5l2.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

/* ── Экран успеха ───────────────────────────────────────────────── */
function SuccessScreen({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "2rem 0 0.5rem" }}>
      <div
        style={{
          width: 64, height: 64,
          borderRadius: "50%",
          background: "rgba(29,184,166,0.15)",
          border: `2px solid ${TEAL}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 1.25rem",
        }}
      >
        <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
          <path d="M2 11L10 19L26 3" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2 style={{
        fontFamily: '"Borsok", sans-serif',
        color: "#fff",
        fontSize: "1.5rem",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        margin: "0 0 0.6rem",
      }}>
        Заявка отправлена!
      </h2>
      <p style={{
        fontFamily: '"BerlinType", sans-serif',
        color: "rgba(255,255,255,0.55)",
        fontSize: "0.9rem",
        margin: "0 0 2rem",
        lineHeight: 1.5,
      }}>
        Мы свяжемся с вами в ближайшее время
        <br />для подтверждения записи.
      </p>
      <button
        onClick={onClose}
        style={{
          background: TEAL,
          border: "none",
          borderRadius: 12,
          color: "#fff",
          fontFamily: '"Borsok", sans-serif',
          fontSize: "0.95rem",
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          padding: "0.8rem 2.5rem",
          cursor: "pointer",
        }}
      >
        Закрыть
      </button>
    </div>
  );
}

/* ── Главный компонент ──────────────────────────────────────────── */
const EMPTY_SERVICES = () =>
  Object.fromEntries(SERVICES.map(s => [s.id, { checked: false, hours: "1" }]));

export default function BookingModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [name,       setName]       = useState("");
  const [phone,      setPhone]      = useState("");
  const [telegram,   setTelegram]   = useState("");
  const [selDate,    setSelDate]    = useState<Date | null>(null);
  const [selTime,    setSelTime]    = useState("");
  const [services,   setServices]   = useState<Record<string, { checked: boolean; hours: string }>>(EMPTY_SERVICES);
  const [comment,    setComment]    = useState("");
  const [calOpen,    setCalOpen]    = useState(false);
  const [timeOpen,   setTimeOpen]   = useState(false);
  const [busyTimes,  setBusyTimes]  = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitErr,  setSubmitErr]  = useState("");
  const [success,    setSuccess]    = useState(false);

  const chosenServiceIds = SERVICES.filter(s => services[s.id]?.checked).map(s => s.id);
  const onlyMixingSelected = chosenServiceIds.length === 1 && chosenServiceIds[0] === "mixing";

  const resetForm = useCallback(() => {
    setName(""); setPhone(""); setTelegram("");
    setSelDate(null); setSelTime("");
    setServices(EMPTY_SERVICES());
    setComment("");
    setCalOpen(false); setTimeOpen(false);
    setBusyTimes([]);
    setSubmitErr(""); setSuccess(false);
  }, []);

  const close = useCallback(() => {
    onClose();
    resetForm();
  }, [onClose, resetForm]);

  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isOpen, close]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  /* выбор даты + загрузка занятых слотов */
  const handleDateSelect = async (d: Date) => {
    setSelDate(d);
    setSelTime("");
    setCalOpen(false);
    setBusyTimes([]);
    try {
      const res = await fetch(`${API}/bookings/busy?date=${localDateStr(d)}`);
      if (res.ok) {
        const data = await res.json();
        setBusyTimes(data.busy ?? []);
      }
    } catch { /* ignore — покажем все слоты доступными */ }
  };

  const toggleService = (id: string) =>
    setServices(prev => ({ ...prev, [id]: { ...prev[id], checked: !prev[id].checked } }));

  const setHours = (id: string, hours: string) =>
    setServices(prev => ({ ...prev, [id]: { ...prev[id], hours } }));

  /* отправка формы */
  const handleSubmit = async () => {
    setSubmitErr("");

    if (name.trim().length < 3) {
      setSubmitErr("Введите имя (не менее 3 символов)");
      return;
    }
    if (!phone.startsWith("+") || phone.replace(/\D/g, "").length < 10) {
      setSubmitErr("Номер телефона должен начинаться с + и содержать не менее 10 цифр");
      return;
    }
    if (telegram.trim() && !telegram.trim().startsWith("@")) {
      setSubmitErr("Telegram username должен начинаться с @");
      return;
    }

    const chosenServices = SERVICES.filter(s => services[s.id].checked);
    if (chosenServices.length === 0) {
      setSubmitErr("Выберите хотя бы одну услугу");
      return;
    }

    const onlyMixing = chosenServices.length === 1 && chosenServices[0].id === "mixing";

    if (!onlyMixing) {
      if (!selDate) { setSubmitErr("Выберите дату записи"); return; }
      if (!selTime) { setSubmitErr("Выберите время записи"); return; }
    }

    const requestDetails = chosenServices
      .map(s => (s.hasHours ? `${s.label} — ${services[s.id].hours} ч.` : s.label))
      .join(", ");

    const durationHours = Math.max(
      1,
      ...chosenServices
        .filter(s => s.hasHours)
        .map(s => parseInt(services[s.id].hours) || 1)
    );

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name:         name.trim(),
          phone_number:      phone,
          telegram_username: telegram,
          desired_date:      onlyMixing ? "1970-01-01" : localDateStr(selDate!),
          desired_time:      onlyMixing ? "00:00"      : selTime,
          duration_hours:    durationHours,
          request_details:   requestDetails,
          comment,
        }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const text = await res.text();
        setSubmitErr(text.trim() || "Не удалось отправить заявку. Попробуйте ещё раз.");
      }
    } catch {
      setSubmitErr("Не удалось подключиться к серверу. Проверьте соединение.");
    } finally {
      setSubmitting(false);
    }
  };

  const fmtDate = (d: Date) =>
    d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });

  const input: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: 12,
    color: "#fff",
    padding: "0.7rem 1rem",
    fontSize: "0.93rem",
    fontFamily: '"BerlinType", sans-serif',
    outline: "none",
    boxSizing: "border-box",
  };

  const lbl: React.CSSProperties = {
    display: "block",
    fontFamily: '"BerlinType", sans-serif',
    color: "rgba(255,255,255,0.4)",
    fontSize: "0.68rem",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: "0.35rem",
  };

  return createPortal(
    <div
      onClick={close}
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "rgba(7,56,53,0.97)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 24,
          padding: "2rem 2rem 1.75rem",
          width: "100%",
          maxWidth: 500,
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 40px 120px rgba(0,0,0,0.65)",
        }}
      >
        {/* заголовок */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <h2 style={{
            fontFamily: '"Borsok", sans-serif',
            color: "#fff",
            fontSize: "clamp(1.3rem, 4vw, 1.75rem)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            margin: 0,
          }}>
            Записаться
          </h2>
          <button
            onClick={close}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "50%",
              width: 34, height: 34,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", cursor: "pointer", fontSize: 20, flexShrink: 0,
            }}
          >×</button>
        </div>

        {/* экран успеха */}
        {success ? (
          <SuccessScreen onClose={close} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>

            {/* Имя */}
            <div>
              <label style={lbl}>Имя</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Как к Вам обращаться?"
                style={input}
              />
            </div>

            {/* Телефон */}
            <div>
              <label style={lbl}>Номер телефона</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+7 (999) 000-00-00"
                style={input}
              />
            </div>

            {/* Telegram */}
            <div>
              <label style={lbl}>Telegram Username</label>
              <input
                type="text"
                value={telegram}
                onChange={e => setTelegram(e.target.value)}
                placeholder="Укажите, если предпочитаете этот тип связи"
                style={input}
              />
            </div>

            {/* Услуги */}
            <div>
              <label style={lbl}>Что Вы хотите сделать?</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                {SERVICES.map(svc => {
                  const st = services[svc.id];
                  return (
                    <div
                      key={svc.id}
                      onClick={() => toggleService(svc.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.7rem",
                        background: st.checked ? "rgba(29,184,166,0.1)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${st.checked ? "rgba(29,184,166,0.35)" : "rgba(255,255,255,0.1)"}`,
                        borderRadius: 10,
                        padding: "0.55rem 0.85rem",
                        cursor: "pointer",
                        userSelect: "none",
                        transition: "background 0.18s, border-color 0.18s",
                      }}
                    >
                      <div style={{
                        width: 17, height: 17,
                        borderRadius: 5,
                        border: `2px solid ${st.checked ? TEAL : "rgba(255,255,255,0.3)"}`,
                        background: st.checked ? TEAL : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.15s",
                      }}>
                        {st.checked && (
                          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                            <path d="M1 3.5L3.2 6L8 1" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>

                      <span style={{ fontFamily: '"BerlinType", sans-serif', color: "#fff", fontSize: "0.88rem", flex: 1 }}>
                        {svc.label}
                      </span>

                      {svc.hasHours && st.checked && (
                        <div
                          onClick={e => e.stopPropagation()}
                          style={{ display: "flex", alignItems: "center", gap: 4 }}
                        >
                          <input
                            type="number"
                            min={1}
                            max={24}
                            value={st.hours}
                            onChange={e => setHours(svc.id, e.target.value)}
                            style={{
                              width: 46,
                              background: "rgba(255,255,255,0.1)",
                              border: "1px solid rgba(255,255,255,0.2)",
                              borderRadius: 7,
                              color: "#fff",
                              padding: "3px 6px",
                              fontSize: "0.85rem",
                              fontFamily: '"BerlinType", sans-serif',
                              textAlign: "center",
                              outline: "none",
                            }}
                          />
                          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem", fontFamily: '"BerlinType", sans-serif' }}>ч.</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {onlyMixingSelected && (
              <div style={{
                background: "rgba(29,184,166,0.08)",
                border: "1px solid rgba(29,184,166,0.3)",
                borderRadius: 10,
                padding: "0.6rem 0.9rem",
              }}>
                <p style={{
                  fontFamily: '"BerlinType", sans-serif',
                  color: "rgba(255,255,255,0.8)",
                  fontSize: "0.83rem",
                  lineHeight: 1.4,
                  margin: 0,
                }}>
                  Сведение — удалённая услуга, выбирать дату и время не требуется. Мы свяжемся с вами после получения заявки.
                </p>
              </div>
            )}

            {!onlyMixingSelected && (
              <>
                {/* Дата */}
                <div>
                  <label style={lbl}>Дата записи</label>
                  <button
                    onClick={() => { setCalOpen(o => !o); setTimeOpen(false); }}
                    style={{
                      ...input,
                      cursor: "pointer",
                      textAlign: "left",
                      color: selDate ? "#fff" : "rgba(255,255,255,0.32)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.55rem",
                    }}
                  >
                    <IconCalendar />
                    {selDate ? fmtDate(selDate) : "Выберите день"}
                  </button>
                  {calOpen && (
                    <Calendar selected={selDate} onSelect={handleDateSelect} />
                  )}
                </div>

                {/* Время */}
                <div>
                  <label style={lbl}>Время записи</label>
                  <button
                    onClick={() => { setTimeOpen(o => !o); setCalOpen(false); }}
                    style={{
                      ...input,
                      cursor: "pointer",
                      textAlign: "left",
                      color: selTime ? "#fff" : "rgba(255,255,255,0.32)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.55rem",
                    }}
                  >
                    <IconClock />
                    {selTime || "Выберите время"}
                  </button>
                  {timeOpen && (
                    <div
                      style={{
                        marginTop: 8,
                        display: "grid",
                        gridTemplateColumns: "repeat(5, 1fr)",
                        gap: 4,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 12,
                        padding: "0.5rem",
                        maxHeight: 176,
                        overflowY: "auto",
                      }}
                    >
                      {TIME_SLOTS.map(slot => {
                        const disabled = isSlotDisabled(slot, selDate, busyTimes);
                        const isSel    = slot === selTime;
                        const isNight  = isNightSlot(slot);
                        return (
                          <button
                            key={slot}
                            disabled={disabled}
                            onClick={() => { setSelTime(slot); setTimeOpen(false); }}
                            style={{
                              background: isSel ? TEAL : isNight ? "rgba(255,200,50,0.06)" : "none",
                              border: `1px solid ${isSel ? TEAL : isNight ? "rgba(255,200,50,0.2)" : "rgba(255,255,255,0.1)"}`,
                              borderRadius: 7,
                              color: disabled ? "rgba(255,255,255,0.18)" : "#fff",
                              cursor: disabled ? "not-allowed" : "pointer",
                              padding: "5px 2px",
                              fontSize: "0.8rem",
                              fontFamily: '"BerlinType", sans-serif',
                              textAlign: "center",
                              transition: "background 0.12s",
                            }}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* предупреждение о ночном времени */}
                  {selTime && isNightSlot(selTime) && (
                    <div style={{
                      marginTop: 8,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.5rem",
                      background: "rgba(255,200,50,0.08)",
                      border: "1px solid rgba(255,200,50,0.25)",
                      borderRadius: 10,
                      padding: "0.55rem 0.85rem",
                    }}>
                      <span style={{ fontSize: "0.9rem", flexShrink: 0, lineHeight: 1.4 }}>⚠️</span>
                      <p style={{
                        fontFamily: '"BerlinType", sans-serif',
                        color: "rgba(255,220,80,0.9)",
                        fontSize: "0.8rem",
                        lineHeight: 1.45,
                        margin: 0,
                      }}>
                        Ранние и ночные сессии согласовываются отдельно — подавайте заявку заблаговременно.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Дополнительная информация */}
            <div>
              <label style={lbl}>Дополнительная информация</label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Любые пожелания или детали..."
                rows={3}
                style={{ ...input, resize: "vertical", minHeight: 76 }}
              />
            </div>

            {/* Ошибка */}
            {submitErr && (
              <p style={{
                fontFamily: '"BerlinType", sans-serif',
                color: "#f87171",
                fontSize: "0.85rem",
                margin: 0,
                textAlign: "center",
              }}>
                {submitErr}
              </p>
            )}

            {/* Отправить */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                background: submitting ? "rgba(29,184,166,0.5)" : TEAL,
                border: "none",
                borderRadius: 12,
                color: "#fff",
                fontFamily: '"Borsok", sans-serif',
                fontSize: "1rem",
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                padding: "0.9rem 2rem",
                cursor: submitting ? "not-allowed" : "pointer",
                width: "100%",
                marginTop: "0.25rem",
                transition: "background 0.2s",
              }}
            >
              {submitting ? "Отправляем…" : "Отправить заявку"}
            </button>

          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
