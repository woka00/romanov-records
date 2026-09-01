"use client";
import { useState } from "react";
import BookingButton from "./BookingButton";

const LAT = 55.734466;
const LON = 37.589347;

const YANDEX_EMBED = `https://yandex.ru/map-widget/v1/?ll=${LON}%2C${LAT}&z=16&pt=${LON}%2C${LAT}%2Cpm2rdl&mode=whatshere`;

const ROUTE_LINKS = [
  {
    label: "Apple Maps",
    href: `https://maps.apple.com/?daddr=${LAT},${LON}&dirflg=d`,
    icon: "/maps/apple.png",
  },
  {
    label: "Google Maps",
    href: `https://maps.google.com/?q=${LAT},${LON}`,
    icon: "/maps/google.png",
  },
  {
    label: "Яндекс Карты",
    href: `https://yandex.ru/maps/?pt=${LON},${LAT}&z=17&l=map&rtext=~${LAT},${LON}`,
    icon: "/maps/yandex.webp",
    scale: 1.16,
  },
];

export default function Location() {
  const [mapHovered, setMapHovered] = useState(false);

  return (
    <section
      id="location"
      className="relative py-20 px-4 sm:px-8"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

        {/* ── LEFT: Map ──────────────────────────────────────────── */}
        <div className="flex flex-col gap-0">

          {/* Mobile-only: standalone «5 минут» block */}
          <div
            className="lg:hidden mb-6 rounded-2xl px-6 py-5 text-center"
            style={{
              background: "rgba(5,40,38,0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <p
              className="font-heading font-black"
              style={{ fontSize: "clamp(2.8rem, 14vw, 4rem)", color: "#1db8a6", lineHeight: 1 }}
            >
              5 МИНУТ
            </p>
            <p className="font-body text-white text-sm uppercase tracking-widest mt-1">
              от метро «Парк Культуры» 🔴
            </p>
            <p className="font-body text-white/50 text-xs mt-2">Без квестов и «я заблудился».</p>
            <p className="font-body text-white/50 text-xs">Быстрее доедешь — больше запишем.</p>
          </div>

          {/* Map wrapper + overlays */}
          <div className="relative">

            {/* "Локация" title badge — centered on top boundary */}
            <div
              className="map-overlay absolute left-0 right-0 z-20 flex justify-center"
              style={{
                top: 0,
                transform: mapHovered ? "translateY(calc(-50% - 4px))" : "translateY(-50%)",
                opacity: mapHovered ? 0 : 1,
                transition: "opacity 0.3s ease, transform 0.3s ease",
              }}
            >
              <div
                className="font-heading font-black text-white rounded-full text-2xl uppercase tracking-widest"
                style={{
                  background: "#0a4a45",
                  border: "2px solid rgba(255,255,255,0.2)",
                  padding: "0.55rem 2.5rem 0.25rem",
                }}
              >
                Локация
              </div>
            </div>

            {/* "5 минут" badge — desktop only, top-left on map */}
            <div
              className="map-overlay absolute z-20 hidden lg:block"
              style={{
                top: 28, left: -16,
                opacity: mapHovered ? 0 : 1,
                transform: mapHovered ? "translateX(-6px)" : "translateX(0)",
                transition: "opacity 0.3s ease, transform 0.3s ease",
              }}
            >
              <div
                className="font-body px-5 py-3 rounded-2xl leading-snug"
                style={{
                  background: "rgba(7,56,53,0.92)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <p className="font-heading font-black text-studio-teal text-2xl">5 минут</p>
                <p className="text-white text-sm uppercase tracking-widest">от метро «Парк Культуры»</p>
                <p className="text-white/50 text-xs mt-0.5">Без квестов и «я заблудился».</p>
                <p className="text-white/50 text-xs">Быстрее доедешь — больше запишем.</p>
              </div>
            </div>

            {/* map iframe */}
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{ height: 400 }}
              onMouseEnter={() => setMapHovered(true)}
              onMouseLeave={() => setMapHovered(false)}
            >
              <iframe
                src={YANDEX_EMBED}
                width="100%"
                height="100%"
                allowFullScreen
                title="Romanov Records на карте"
                style={{ display: "block", border: "none" }}
              />
            </div>

            {/* Route buttons + address */}
            <div className="mt-5">
              <p className="font-body text-white/50 text-xs uppercase tracking-widest mb-3">
                Построить маршрут:
              </p>
              <div className="flex items-center gap-3 mb-3">
                {ROUTE_LINKS.map(({ label, href, icon, scale = 1 }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-11 h-11 rounded-[12px] flex items-center justify-center flex-shrink-0 transition-transform hover:scale-110 active:scale-95 overflow-hidden"
                    style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={icon}
                      alt=""
                      aria-hidden="true"
                      className="block w-full h-full"
                      draggable={false}
                      style={{ transform: `scale(${scale})` }}
                    />
                  </a>
                ))}
              </div>
              <p className="font-body text-white/70 text-sm">Ул. Тимура Фрунзе 16</p>
            </div>

          </div>
        </div>

        {/* ── RIGHT: Contacts ────────────────────────────────────── */}
        <div
          id="contacts"
          className="flex flex-col gap-6 pt-4"
          style={{
            position: "relative",
            background: "rgba(7,56,53,0.45)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 24,
            padding: "2rem 2rem 1.5rem",
          }}
        >
          <h2
            className="font-heading font-black text-white uppercase"
            style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", letterSpacing: "0.08em" }}
          >
            Контакты
          </h2>

          {/* phones */}
          <div className="flex flex-col gap-1">
            <p className="font-body text-white/50 text-xs uppercase tracking-widest mb-1">для записи</p>
            {["+7 (985) 022 7554", "+7 (903) 752 7530"].map((phone) => (
              <p key={phone} className="font-body text-white text-lg">
                <a href={`tel:${phone.replace(/\D/g, "")}`} className="hover:text-studio-teal transition-colors">
                  {phone}
                </a>
              </p>
            ))}
          </div>

          {/* email */}
          <div>
            <p className="font-body text-white/50 text-xs uppercase tracking-widest mb-1">по вопросам сотрудничества</p>
            <a
              href="mailto:romanovrecords1@gmail.com"
              className="font-body text-white hover:text-studio-teal transition-colors"
            >
              romanovrecords1@gmail.com
            </a>
          </div>

          {/* social */}
          <div className="flex flex-col gap-2">
            <div>
              <p className="font-body text-white/50 text-xs uppercase tracking-widest mb-1">telegram</p>
              <a
                href="https://t.me/romanovrecordss"
                target="_blank" rel="noopener noreferrer"
                className="font-body text-white hover:text-studio-teal transition-colors block"
              >
                @romanovrecordss — канал
              </a>
              <a
                href="https://t.me/Romanov_Records_studio"
                target="_blank" rel="noopener noreferrer"
                className="font-body text-white hover:text-studio-teal transition-colors block"
              >
                @Romanov_Records_studio — по вопросам
              </a>
            </div>
            <div>
              <p className="font-body text-white/50 text-xs uppercase tracking-widest mb-1">instagram</p>
              <a
                href="https://www.instagram.com/romanov.records/"
                target="_blank" rel="noopener noreferrer"
                className="font-body text-white hover:text-studio-teal transition-colors block"
              >
                @romanov.records
              </a>
            </div>
            <div>
              <p className="font-body text-white/50 text-xs uppercase tracking-widest mb-1">tiktok</p>
              <a
                href="https://www.tiktok.com/@romanov.records"
                target="_blank" rel="noopener noreferrer"
                className="font-body text-white hover:text-studio-teal transition-colors block"
              >
                @romanov.records
              </a>
            </div>
          </div>

          {/* social icon buttons — top-right corner, vertical */}
          <div style={{
            position: "absolute",
            top: "1.25rem",
            right: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}>
            {/* Telegram */}
            <a
              href="https://t.me/Romanov_Records_studio"
              target="_blank" rel="noopener noreferrer"
              className="w-11 h-11 rounded-full flex items-center justify-center transition-colors"
              style={{ background: "rgba(255,255,255,0.1)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(29,184,166,0.3)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
              aria-label="Telegram"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21.8 2.6L2.4 10c-1.3.5-1.3 1.3-.2 1.6l4.9 1.5 11.3-7.1c.5-.3 1 0 .6.4L8.5 16.5l-.4 5c.6 0 .9-.3 1.2-.6l2.9-2.8 4.9 3.7c.9.5 1.5.2 1.7-.8l3.1-14.7c.4-1.4-.5-2-.8-1.7z" fill="white"/>
              </svg>
            </a>
            {/* Instagram */}
            <a
              href="https://www.instagram.com/romanov.records/"
              target="_blank" rel="noopener noreferrer"
              className="w-11 h-11 rounded-full flex items-center justify-center transition-colors"
              style={{ background: "rgba(255,255,255,0.1)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(29,184,166,0.3)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
              aria-label="Instagram"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="2"/>
                <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="2"/>
                <circle cx="17.5" cy="6.5" r="1" fill="white"/>
              </svg>
            </a>
            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@romanov.records"
              target="_blank" rel="noopener noreferrer"
              className="w-11 h-11 rounded-full flex items-center justify-center transition-colors"
              style={{ background: "rgba(255,255,255,0.1)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(29,184,166,0.3)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
              aria-label="TikTok"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="white">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.79 1.52V6.76a4.85 4.85 0 0 1-1.02-.07z"/>
              </svg>
            </a>
          </div>

          {/* bottom CTA */}
          <div className="flex items-center gap-6 mt-2">
            <div className="flex flex-col">
              <span className="font-body text-studio-teal text-sm">работаем 24/7</span>
              <span className="font-body text-white/50 text-xs">5 мин от метро</span>
            </div>
            <BookingButton />
          </div>
        </div>

      </div>
    </section>
  );
}
