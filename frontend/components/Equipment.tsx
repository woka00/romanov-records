"use client";

import { useEffect, useRef, useState } from "react";

interface EquipCard { id: string; name: string }

const CARDS: EquipCard[] = [
  { id: "soyuz",     name: "СОЮЗ 017 FET" },
  { id: "neumann87", name: "Neumann U 87" },
  { id: "apollo",    name: "Universal Audio Apollo x4" },
  { id: "kh310",     name: "Neumann KH 310 A R G" },
  { id: "dt700",     name: "DT 700 Pro X" },
  { id: "lounge",    name: "Лаунж зона" },
];

const IMG: Record<string, string> = {
  soyuz:     "/equipment_v2/closed1.png",
  neumann87: "/equipment_v2/closed2.png",
  apollo:    "/equipment_v2/closed3.png",
  kh310:     "/equipment_v2/closed4.png",
  dt700:     "/equipment_v2/closed6.png",
  lounge:    "/equipment/lounge.png",
};

type Role = "center" | "left" | "right" | "hidden-left" | "hidden-right";

function getRole(idx: number, active: number, total: number): Role {
  let rel = idx - active;
  if (rel > total / 2)  rel -= total;
  if (rel <= -total / 2) rel += total;
  if (rel === 0)  return "center";
  if (rel === -1) return "left";
  if (rel === 1)  return "right";
  return rel < 0 ? "hidden-left" : "hidden-right";
}

const ROLE_DESKTOP: Record<Role, React.CSSProperties> = {
  center: {
    transform:    "translateX(-50%) scale(1.04)",
    filter:       "none",
    opacity:      1,
    zIndex:       10,
    pointerEvents: "auto",
    boxShadow:    "0 40px 90px rgba(0,0,0,0.65)",
  },
  left: {
    transform:    "translateX(calc(-50% - 73%)) rotate(-10deg) scale(0.84)",
    filter:       "blur(5px)",
    opacity:      1,
    zIndex:       5,
    pointerEvents: "auto",
    boxShadow:    "0 8px 28px rgba(0,0,0,0.35)",
  },
  right: {
    transform:    "translateX(calc(-50% + 73%)) rotate(10deg) scale(0.84)",
    filter:       "blur(5px)",
    opacity:      1,
    zIndex:       5,
    pointerEvents: "auto",
    boxShadow:    "0 8px 28px rgba(0,0,0,0.35)",
  },
  "hidden-left": {
    transform:    "translateX(calc(-50% - 165%)) rotate(-15deg) scale(0.7)",
    filter:       "blur(8px)",
    opacity:      0,
    zIndex:       1,
    pointerEvents: "none",
    boxShadow:    "none",
  },
  "hidden-right": {
    transform:    "translateX(calc(-50% + 165%)) rotate(15deg) scale(0.7)",
    filter:       "blur(8px)",
    opacity:      0,
    zIndex:       1,
    pointerEvents: "none",
    boxShadow:    "none",
  },
};

const ROLE_MOBILE: Record<Role, React.CSSProperties> = {
  center: {
    transform:    "translateX(-50%) scale(1.02)",
    filter:       "none",
    opacity:      1,
    zIndex:       10,
    pointerEvents: "auto",
    boxShadow:    "0 30px 70px rgba(0,0,0,0.6)",
  },
  left: {
    transform:    "translateX(calc(-50% - 90%)) rotate(-8deg) scale(0.82)",
    filter:       "blur(3px)",
    opacity:      0.65,
    zIndex:       5,
    pointerEvents: "auto",
    boxShadow:    "0 8px 28px rgba(0,0,0,0.35)",
  },
  right: {
    transform:    "translateX(calc(-50% + 90%)) rotate(8deg) scale(0.82)",
    filter:       "blur(3px)",
    opacity:      0.65,
    zIndex:       5,
    pointerEvents: "auto",
    boxShadow:    "0 8px 28px rgba(0,0,0,0.35)",
  },
  "hidden-left": {
    transform:    "translateX(calc(-50% - 200%)) rotate(-15deg) scale(0.7)",
    filter:       "blur(8px)",
    opacity:      0,
    zIndex:       1,
    pointerEvents: "none",
    boxShadow:    "none",
  },
  "hidden-right": {
    transform:    "translateX(calc(-50% + 200%)) rotate(15deg) scale(0.7)",
    filter:       "blur(8px)",
    opacity:      0,
    zIndex:       1,
    pointerEvents: "none",
    boxShadow:    "none",
  },
};

function Card({
  card,
  role,
  isMobile,
  onSideClick,
}: {
  card: EquipCard;
  role: Role;
  isMobile: boolean;
  onSideClick: () => void;
}) {
  const isSide = role === "left" || role === "right";
  const ROLE = isMobile ? ROLE_MOBILE : ROLE_DESKTOP;

  return (
    <div
      onClick={isSide ? onSideClick : undefined}
      style={{
        position:    "absolute",
        left:        "50%",
        top:         0,
        width:       isMobile ? "78%" : "34%",
        borderRadius: 22,
        overflow:    "hidden",
        cursor:      isSide ? "pointer" : "default",
        userSelect:  "none",
        willChange:  "transform, filter",
        transition:
          "transform 0.45s cubic-bezier(0.4,0,0.2,1), " +
          "filter 0.35s ease, opacity 0.35s ease, box-shadow 0.35s ease",
        ...ROLE[role],
      }}
    >
      {IMG[card.id] && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={IMG[card.id]}
          alt={card.name}
          draggable={false}
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      )}
    </div>
  );
}

function Arrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      aria-label={side === "left" ? "Предыдущая" : "Следующая"}
      style={{
        position: "relative",
        zIndex: 30,
        width: 58,
        height: 58,
        borderRadius: "50%",
        border: `2px solid ${hov ? "#dffff9" : "rgba(223,255,249,0.8)"}`,
        background: hov ? "#1db8a6" : "rgba(7,56,53,0.88)",
        backdropFilter: "blur(12px)",
        boxShadow: hov
          ? "0 14px 34px rgba(29,184,166,0.36), inset 0 0 0 1px rgba(255,255,255,0.22)"
          : "0 12px 30px rgba(0,0,0,0.42), inset 0 0 0 1px rgba(255,255,255,0.10)",
        color: "#dffff9",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease",
        transform: hov ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
        {side === "left"
          ? <path d="M11 4L6 9L11 14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
          : <path d="M7 4L12 9L7 14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>}
      </svg>
    </button>
  );
}

export default function Equipment() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const total = CARDS.length;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  const prev = () => setActiveIndex((i) => (i - 1 + total) % total);
  const next = () => setActiveIndex((i) => (i + 1) % total);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    if (dx > 40) next();
    else if (dx < -40) prev();
    touchStartX.current = null;
  };

  return (
    <section id="equipment" className="relative py-20">
      <div className="flex justify-center mb-14">
        <h2
          className="section-title font-heading font-black text-white uppercase"
          style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", letterSpacing: "0.06em" }}
        >
          Оборудование
        </h2>
      </div>

      <div
        style={{ position: "relative", width: "100%", height: "clamp(340px, 56vw, 800px)" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {CARDS.map((card, idx) => {
          const role = getRole(idx, activeIndex, total);
          return (
            <Card
              key={card.id}
              card={card}
              role={role}
              isMobile={isMobile}
              onSideClick={() => {
                if (role === "left")  prev();
                if (role === "right") next();
              }}
            />
          );
        })}

      </div>

      <div
        aria-label="Навигация по оборудованию"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
          marginTop: 76,
        }}
      >
        <Arrow side="left" onClick={prev} />

        {/* точки */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
          {CARDS.map((card, i) => (
            <button
              key={card.id}
              onClick={() => setActiveIndex(i)}
              aria-label={card.name}
              style={{
                display:    "block",
                width:      i === activeIndex ? 24 : 8,
                height:     8,
                borderRadius: 4,
                border:     "none",
                padding:    0,
                cursor:     "pointer",
                background: i === activeIndex ? "#1db8a6" : "rgba(255,255,255,0.45)",
                transition: "width 0.3s ease, background 0.3s ease",
                flexShrink: 0,
              }}
            />
          ))}
        </div>

        <Arrow side="right" onClick={next} />
      </div>
    </section>
  );
}
