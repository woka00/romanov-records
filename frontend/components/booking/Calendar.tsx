"use client";

import { useState } from "react";
import { sameDay, TEAL } from "./config";

const RU_MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];
const RU_DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function Calendar({
  selected,
  onSelect,
}: {
  selected: Date | null;
  onSelect: (date: Date) => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [view, setView] = useState(() => {
    const date = selected ?? new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });

  const year = view.getFullYear();
  const month = view.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const canGoBack =
    new Date(year, month, 1) > new Date(today.getFullYear(), today.getMonth(), 1);

  return (
    <div style={{ marginTop: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "0.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
        <button
          type="button"
          disabled={!canGoBack}
          aria-label="Предыдущий месяц"
          onClick={() => setView(new Date(year, month - 1, 1))}
          style={{ background: "none", border: "none", color: canGoBack ? "#fff" : "rgba(255,255,255,0.2)", cursor: canGoBack ? "pointer" : "default", fontSize: 20, padding: "0 8px", lineHeight: 1 }}
        >
          ‹
        </button>
        <span style={{ fontFamily: '"Borsok", sans-serif', color: "#fff", fontSize: "0.85rem", letterSpacing: "0.05em" }}>
          {RU_MONTHS[month]} {year}
        </span>
        <button
          type="button"
          aria-label="Следующий месяц"
          onClick={() => setView(new Date(year, month + 1, 1))}
          style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 20, padding: "0 8px", lineHeight: 1 }}
        >
          ›
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
        {RU_DAYS.map((day) => (
          <div key={day} style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: "0.67rem", padding: "2px 0" }}>
            {day}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
        {cells.map((day, index) => {
          if (day === null) return <div key={`empty-${index}`} />;
          const date = new Date(year, month, day);
          const isPast = date < today;
          const isToday = sameDay(date, today);
          const isSelected = selected ? sameDay(date, selected) : false;
          return (
            <button
              type="button"
              key={day}
              disabled={isPast}
              aria-pressed={isSelected}
              onClick={() => onSelect(date)}
              style={{ background: isSelected ? TEAL : isToday ? "rgba(29,184,166,0.15)" : "none", border: isToday && !isSelected ? `1px solid ${TEAL}` : "1px solid transparent", borderRadius: 7, color: isPast ? "rgba(255,255,255,0.18)" : "#fff", cursor: isPast ? "not-allowed" : "pointer", padding: "5px 0", fontSize: "0.82rem", textAlign: "center", transition: "background 0.12s", fontFamily: '"BerlinType", sans-serif' }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CalendarIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ opacity: 0.45, flexShrink: 0 }}>
      <rect x="1" y="2" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1 5.5h12" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 1v2M10 1v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
