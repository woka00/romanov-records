"use client";

import { isNightSlot, isSlotDisabled, TEAL, TIME_SLOTS } from "./config";

export function TimeSlotPicker({
  busyTimes,
  selected,
  selectedDate,
  onSelect,
}: {
  busyTimes: string[];
  selected: string;
  selectedDate: Date | null;
  onSelect: (slot: string) => void;
}) {
  return (
    <>
      <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "0.5rem", maxHeight: 176, overflowY: "auto" }}>
        {TIME_SLOTS.map((slot) => {
          const disabled = isSlotDisabled(slot, selectedDate, busyTimes);
          const isSelected = slot === selected;
          const isNight = isNightSlot(slot);
          return (
            <button
              type="button"
              key={slot}
              disabled={disabled}
              aria-pressed={isSelected}
              onClick={() => onSelect(slot)}
              style={{ background: isSelected ? TEAL : isNight ? "rgba(255,200,50,0.06)" : "none", border: `1px solid ${isSelected ? TEAL : isNight ? "rgba(255,200,50,0.2)" : "rgba(255,255,255,0.1)"}`, borderRadius: 7, color: disabled ? "rgba(255,255,255,0.18)" : "#fff", cursor: disabled ? "not-allowed" : "pointer", padding: "5px 2px", fontSize: "0.8rem", fontFamily: '"BerlinType", sans-serif', textAlign: "center", transition: "background 0.12s" }}
            >
              {slot}
            </button>
          );
        })}
      </div>

      {selected && isNightSlot(selected) ? (
        <div style={{ marginTop: 8, display: "flex", alignItems: "flex-start", gap: "0.5rem", background: "rgba(255,200,50,0.08)", border: "1px solid rgba(255,200,50,0.25)", borderRadius: 10, padding: "0.55rem 0.85rem" }}>
          <span aria-hidden="true" style={{ fontSize: "0.9rem", flexShrink: 0, lineHeight: 1.4 }}>⚠️</span>
          <p style={{ fontFamily: '"BerlinType", sans-serif', color: "rgba(255,220,80,0.9)", fontSize: "0.8rem", lineHeight: 1.45, margin: 0 }}>
            Ранние и ночные сессии согласовываются отдельно — подавайте заявку заблаговременно.
          </p>
        </div>
      ) : null}
    </>
  );
}

export function ClockIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ opacity: 0.45, flexShrink: 0 }}>
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 4v3.5l2.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
