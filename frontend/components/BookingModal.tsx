"use client";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Calendar, CalendarIcon } from "./booking/Calendar";
import { SERVICES, TEAL } from "./booking/config";
import { SuccessScreen } from "./booking/SuccessScreen";
import { ClockIcon, TimeSlotPicker } from "./booking/TimeSlotPicker";
import { useBookingForm } from "./booking/useBookingForm";

export default function BookingModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    availabilityError,
    busyTimes,
    calendarOpen: calOpen,
    close,
    comment,
    name,
    onlyMixingSelected,
    phone,
    selectedDate: selDate,
    selectedTime: selTime,
    selectDate: handleDateSelect,
    services,
    setCalendarOpen: setCalOpen,
    setComment,
    setName,
    setPhone,
    setSelectedTime: setSelTime,
    setServiceHours: setHours,
    setTelegram,
    setTimeOpen,
    submit: handleSubmit,
    submitError: submitErr,
    submitting,
    success,
    telegram,
    timeOpen,
    toggleService,
  } = useBookingForm(isOpen, onClose);

  if (!isOpen) return null;

  const fmtDate = (d: Date) =>
    d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });

  const input: CSSProperties = {
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

  const lbl: CSSProperties = {
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
                    <CalendarIcon />
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
                    type="button"
                    disabled={Boolean(availabilityError)}
                    onClick={() => { setTimeOpen(o => !o); setCalOpen(false); }}
                    style={{
                      ...input,
                      cursor: availabilityError ? "not-allowed" : "pointer",
                      textAlign: "left",
                      color: selTime ? "#fff" : "rgba(255,255,255,0.32)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.55rem",
                    }}
                  >
                    <ClockIcon />
                    {selTime || "Выберите время"}
                  </button>
                  {availabilityError ? (
                    <p role="alert" style={{ fontFamily: '"BerlinType", sans-serif', color: "#f87171", fontSize: "0.8rem", lineHeight: 1.4, margin: "0.5rem 0 0" }}>
                      {availabilityError}
                    </p>
                  ) : null}
                  {timeOpen && (
                    <TimeSlotPicker
                      busyTimes={busyTimes}
                      selected={selTime}
                      selectedDate={selDate}
                      onSelect={(slot) => { setSelTime(slot); setTimeOpen(false); }}
                    />
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
