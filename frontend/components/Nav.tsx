"use client";
import { useEffect, useState } from "react";

const LINKS = [
  { label: "главная",      href: "#hero" },
  { label: "тарифы",       href: "#tariffs" },
  { label: "локация",      href: "#location" },
  { label: "контакты",     href: "#contacts" },
  { label: "оборудование", href: "#equipment" },
] as const;

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  const pillBg = scrolled ? "rgba(7,56,53,0.85)" : "rgba(10,74,69,0.4)";

  return (
    <>
      {/* ── Desktop: centered pill ───────────────────────────── */}
      <nav
        className="hidden md:block fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300"
        style={{ backdropFilter: scrolled ? "blur(12px)" : "none" }}
      >
        <ul
          className="flex items-center gap-1 px-3 py-2 rounded-full"
          style={{ border: "1.5px solid rgba(255,255,255,0.45)", background: pillBg }}
        >
          {LINKS.map(({ label, href }) => (
            <li key={href}>
              <a
                href={href}
                onClick={(e) => handleClick(e, href)}
                className="block px-4 py-1.5 rounded-full text-white font-heading font-medium uppercase tracking-wide hover:bg-white/15 transition-colors duration-200 whitespace-nowrap"
                style={{ fontSize: "0.78rem" }}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Mobile: hamburger ────────────────────────────────── */}
      <div className="hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setOpen(!open)}
          aria-label="Меню"
          className="w-10 h-10 flex flex-col items-center justify-center gap-[5px] rounded-full"
          style={{
            background: pillBg,
            backdropFilter: "blur(14px)",
            border: "1.5px solid rgba(255,255,255,0.35)",
          }}
        >
          <span
            className="block w-[18px] h-[2px] bg-white rounded transition-all duration-300 origin-center"
            style={{ transform: open ? "rotate(45deg) translateY(7px)" : "none" }}
          />
          <span
            className="block w-[18px] h-[2px] bg-white rounded transition-all duration-200"
            style={{ opacity: open ? 0 : 1, transform: open ? "scaleX(0)" : "none" }}
          />
          <span
            className="block w-[18px] h-[2px] bg-white rounded transition-all duration-300 origin-center"
            style={{ transform: open ? "rotate(-45deg) translateY(-7px)" : "none" }}
          />
        </button>

        {/* dropdown */}
        <div
          className="absolute top-12 right-0 rounded-2xl overflow-hidden transition-all duration-300"
          style={{
            background: "rgba(5,45,42,0.97)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.12)",
            minWidth: 190,
            transformOrigin: "top right",
            opacity: open ? 1 : 0,
            transform: open ? "scale(1)" : "scale(0.95)",
            pointerEvents: open ? "auto" : "none",
          }}
        >
          {LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              onClick={(e) => handleClick(e, href)}
              className="block px-6 py-3.5 text-white font-heading font-medium uppercase tracking-widest hover:bg-white/10 active:bg-white/15 transition-colors"
              style={{
                fontSize: "0.78rem",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
