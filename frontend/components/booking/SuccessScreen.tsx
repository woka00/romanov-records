"use client";

import { TEAL } from "./config";

export function SuccessScreen({ onClose }: { onClose: () => void }) {
  return (
    <div role="status" style={{ textAlign: "center", padding: "2rem 0 0.5rem" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(29,184,166,0.15)", border: `2px solid ${TEAL}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
        <svg aria-hidden="true" width="28" height="22" viewBox="0 0 28 22" fill="none">
          <path d="M2 11L10 19L26 3" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 style={{ fontFamily: '"Borsok", sans-serif', color: "#fff", fontSize: "1.5rem", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 0.6rem" }}>
        Заявка отправлена!
      </h2>
      <p style={{ fontFamily: '"BerlinType", sans-serif', color: "rgba(255,255,255,0.55)", fontSize: "0.9rem", margin: "0 0 2rem", lineHeight: 1.5 }}>
        Мы свяжемся с вами в ближайшее время
        <br />для подтверждения записи.
      </p>
      <button
        type="button"
        onClick={onClose}
        style={{ background: TEAL, border: "none", borderRadius: 12, color: "#fff", fontFamily: '"Borsok", sans-serif', fontSize: "0.95rem", letterSpacing: "0.07em", textTransform: "uppercase", padding: "0.8rem 2.5rem", cursor: "pointer" }}
      >
        Закрыть
      </button>
    </div>
  );
}
