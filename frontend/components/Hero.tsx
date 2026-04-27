"use client";
import BookingButton from "./BookingButton";
import { useEffect, useRef } from "react";
import gsap from "gsap";

const IMGS = {
  entrance: "/pngMain/entrance.png",
  studio:   "/pngMain/studio.png",
  logoHeld: "/pngMain/logo-held.png",
  person:   "/pngMain/person.png",
  mic:      "/pngMain/mic.png",
  logo:     "/pngMain/logo.png",
};

const MOBILE_V1 = {
  location:   "/mobile_bg/v1/location.png",
  photoLeft:  "/mobile_bg/v1/photo-left.png",
  neon:       "/mobile_bg/v1/neon.png",
  photoRight: "/mobile_bg/v1/photo-right.png",
  gear:       "/mobile_bg/v1/gear.png",
};

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-reveal", {
        opacity: 0, y: 22, duration: 0.65, stagger: 0.08, ease: "power2.out", delay: 0.4,
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!sectionRef.current) return;
      const cards = sectionRef.current.querySelectorAll<HTMLElement>(".proximity-card");
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dist = Math.sqrt((e.clientX - cx) ** 2 + (e.clientY - cy) ** 2);
        const maxDist = 350;
        const scale = dist < maxDist ? 1 + 0.55 * (1 - dist / maxDist) : 1;
        card.style.transform = `scale(${scale})`;
      });
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="hero-section relative overflow-hidden md:min-h-screen md:flex md:flex-col md:items-center md:justify-center"
    >
      <div className="mobile-hero-v1 md:hidden">
        <div className="mobile-hero-v1-title hero-reveal">
          <h1>ROMANOV<br />RECORDS</h1>
          <p>recording studio</p>
        </div>

        <div className="mobile-hero-v1-booking hero-reveal">
          <BookingButton className="mobile-hero-v1-booking-button" />
        </div>

        <div className="mobile-hero-v1-location hero-reveal">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MOBILE_V1.location} alt="ул. Тимура Фрунзе 16, метро Парк Культуры" draggable={false} />
        </div>

        <div className="mobile-hero-v1-gallery hero-reveal">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MOBILE_V1.photoLeft} alt="" draggable={false} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MOBILE_V1.neon} alt="" draggable={false} className="mobile-hero-v1-neon" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MOBILE_V1.photoRight} alt="" draggable={false} />
        </div>

        <div className="mobile-hero-v1-gear hero-reveal">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MOBILE_V1.gear} alt="" draggable={false} />
        </div>

        <a className="mobile-hero-v1-tariffs hero-reveal" href="#tariffs">
          Тарифы
        </a>
      </div>

      {/* ── Декоративный овал (mobile + desktop) ── */}
      <svg
        className="absolute pointer-events-none select-none hero-reveal hidden md:block"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -55%) rotate(-7deg)",
          width: "clamp(280px, 62vw, 560px)",
          zIndex: 0,
          opacity: 0.55,
        }}
        viewBox="0 0 560 330"
        fill="none"
      >
        <ellipse cx="280" cy="165" rx="278" ry="163" stroke="#38c5d0" strokeWidth="3" />
      </svg>

      {/* ── Верхний левый: золотой микрофон — скрыт на мобильных ── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={IMGS.mic}
        alt="Микрофон"
        className="proximity-card hero-reveal absolute hidden md:block"
        draggable={false}
        style={{
          top: "8%", left: "8%",
          width: 130,
          borderRadius: 22,
          objectFit: "contain",
        }}
      />

      {/* ── Верхний центр: пульт студии — скрыт на мобильных ── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={IMGS.studio}
        alt="Студия"
        className="proximity-card hero-reveal absolute hidden md:block"
        draggable={false}
        style={{
          top: "4%", left: "38%",
          transform: "translateX(-50%)",
          width: 220, height: 235,
          borderRadius: 22,
          objectFit: "cover",
        }}
      />

      {/* ── Верхний правый: человек с логотипом — скрыт на мобильных ── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={IMGS.logoHeld}
        alt="Логотип"
        className="proximity-card hero-reveal absolute hidden md:block"
        draggable={false}
        style={{
          top: "3%", right: "12%",
          width: 220, height: 235,
          borderRadius: 22,
          objectFit: "cover",
        }}
      />

      {/* ── Левый низ: человек за столом — скрыт на мобильных ── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={IMGS.person}
        alt="Звукорежиссёр"
        className="proximity-card hero-reveal absolute hidden md:block"
        draggable={false}
        style={{
          top: "46%", left: "6%",
          width: 185, height: 265,
          borderRadius: 20,
          objectFit: "cover",
        }}
      />

      {/* ── Центр: заголовок + кнопка ── */}
      <div className="relative z-10 text-center px-4 hidden md:block" style={{ marginTop: "-2rem" }}>
        <h1
          className="font-heading font-black text-white leading-none tracking-tight hero-reveal"
          style={{ fontSize: "clamp(3rem, 17vw, 7rem)" }}
        >
          ROMANOV RECORDS
        </h1>
        <p
          className="font-body text-white/80 mt-2 hero-reveal"
          style={{ fontSize: "clamp(1rem, 2.5vw, 1.6rem)", letterSpacing: "0.15em" }}
        >
          recording studio
        </p>
        <div className="hero-reveal flex items-center justify-center mt-6">
          <BookingButton
            className="btn-book text-white hover:bg-white hover:text-studio-dark"
            style={{ fontSize: "0.9rem" }}
          />
        </div>
      </div>

      {/* ── Центр-низ: крупный логотип brain — скрыт на мобильных ── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={IMGS.logo}
        alt=""
        className="proximity-card hero-reveal absolute hidden md:block"
        draggable={false}
        style={{
          top: "60%", left: "37%",
          width: 135, height: 115,
          objectFit: "contain",
        }}
      />

      {/* ── Правый центр: вход в студию — скрыт на мобильных ── */}
      <div
        className="hero-reveal absolute hidden md:block"
        style={{ top: "52%", right: "6%", zIndex: 10 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={IMGS.entrance}
          alt="Вход в студию"
          className="proximity-card"
          draggable={false}
          style={{
            width: 255, height: 310,
            borderRadius: 22,
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>

      {/* ── Нижние волны ── */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 overflow-hidden leading-none hidden md:block">
        <svg viewBox="0 0 1440 200" xmlns="http://www.w3.org/2000/svg"
             preserveAspectRatio="none" style={{ width: "100%", height: "auto", display: "block" }}>
          <path
            d="M0,120 C200,200 400,40 600,100 C800,160 1000,40 1200,100 C1320,130 1400,80 1440,80 L1440,200 L0,200 Z"
            fill="#f5f2ed" opacity="0.15"
          />
          <path
            d="M0,160 C150,100 350,200 600,160 C850,120 1100,200 1440,140 L1440,200 L0,200 Z"
            fill="#f5f2ed" opacity="0.08"
          />
        </svg>
      </div>

    </section>
  );
}
