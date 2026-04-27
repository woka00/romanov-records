"use client";
import BookingButton from "./BookingButton";
// ROMANOV RECORDS — Тарифы section
// LAYOUT: 2-col top row + 3-col bottom row
// HOVER: colour inversion via CSS classes tariff-light / tariff-dark (defined in globals.css)
//   tariff-light (cream bg / dark text)  →  hover becomes dark teal
//   tariff-dark  (dark bg / white text)  →  hover becomes cream
// Each card has: title, description, "записаться" btn, price "5 тысяч"

interface TariffCard {
  id: string;
  title: string;
  description: string;
  variant: "light" | "dark";
  price: React.ReactNode;
}

const DualPrice = () => (
  <div style={{ textAlign: "right", lineHeight: 1.35 }}>
    <div className="font-heading font-black" style={{ fontSize: "1.05rem" }}>
      2 500 ₽
    </div>
    <div className="font-body" style={{ fontSize: "0.7rem", opacity: 0.55 }}>
      со звукарем
    </div>
    <div className="font-heading font-black" style={{ fontSize: "0.95rem", marginTop: "0.2rem" }}>
      1 750 ₽
    </div>
    <div className="font-body" style={{ fontSize: "0.7rem", opacity: 0.55 }}>
      без звукаря
    </div>
  </div>
);

const TARIFFS: TariffCard[] = [
  {
    id: "instruments",
    title: "Запись инструментов",
    description:
      "Раскройте характер вашего инструмента с помощью премиального тракта сигнала. Используем микрофоны Neumann TLM 103, Shure SM7B, СОЮЗ 017 FET и ламповые предусилители, чтобы передать каждую атаку, динамику и нюанс исполнения без «грязи» и цифрового холода. Подбираем оптимальную схему записи под каждый инструмент — от акустической гитары и ударных до струнных, духовых и живых ансамблей.",
    variant: "light",
    price: <DualPrice />,
  },
  {
    id: "vocals",
    title: "Запись вокала",
    description:
      "Раскройте свой голос с помощью премиального тракта сигнала. Используем микрофоны Neumann TLM 103, Shure SM7B, СОЮЗ 017 FET и ламповые предусилители, чтобы передать каждую интонацию и эмоцию без «грязи» и цифрового холода. Помогаем с выбором микрофона под ваш тембр, работаем с ансамблями и бэк-вокалом.",
    variant: "dark",
    price: <DualPrice />,
  },
  {
    id: "mixing",
    title: "Сведение",
    description:
      "Превращаем черновики в готовые треки. Глубокое погружение в жанр: от поп-аранжировок до тяжёлой гитары. Работаем с балансом, частотной коррекцией и стереопанорамой, чтобы ваш трек звучал объёмно, мощно и конкурентоспособно на любых носителях (от наушников до клубных сабвуферов).",
    variant: "dark",
    price: <span className="tariff-price font-heading font-black text-xl">от 15 000 ₽</span>,
  },
  {
    id: "rental",
    title: "Аренда студии",
    description:
      "Творческое пространство без тракта. Арендуйте студию «под ключ»: изолированная комната управления, просторная живая комната для записи. Идеально для репетиций, продакшн-сессий или работы с живым составом. Предоставляем интерфейсы, мониторы и чай/кофе в неограниченном количестве.",
    variant: "light",
    price: <span className="tariff-price font-heading font-black text-xl">договорная</span>,
  },
  {
    id: "turnkey",
    title: "Трек под ключ",
    description:
      "Фиксируем живую энергетику. Записываем ударные, гитары (DI и микрофоном), рояль, духовые и струнные. Используем качественные микрофоны и помещения с правильной акустикой, чтобы сохранить натуральный тембр инструмента, но при этом получить «чистый» материал для сведения.",
    variant: "dark",
    price: <span className="tariff-price font-heading font-black text-xl">от 45 000 ₽</span>,
  },
];

function TariffCard({ card }: { card: TariffCard }) {
  const base =
    "relative rounded-3xl p-7 flex flex-col gap-4 cursor-default " +
    (card.variant === "light" ? "tariff-light" : "tariff-dark");

  return (
    <div className={base}>
      <h3
        className="font-heading font-black text-xl leading-tight uppercase"
        style={{ letterSpacing: "0.02em" }}
      >
        {card.title}
      </h3>

      <p className="font-body text-sm leading-relaxed opacity-75 flex-1">
        {card.description}
      </p>

      <p className="tariff-label font-body text-xs opacity-50 uppercase tracking-widest">
        ближайшая запись сейчас
      </p>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <BookingButton className="btn-book text-sm" style={{ borderColor: "currentColor" }} />
        {card.price}
      </div>
    </div>
  );
}

export default function Tariffs() {
  const top = TARIFFS.slice(0, 2);
  const bottom = TARIFFS.slice(2);

  return (
    <section id="tariffs" className="relative py-20 px-4 sm:px-8">
      {/* section title */}
      <div className="tariffs-section-title flex justify-center mb-12" style={{ paddingTop: "2rem" }}>
        <h2
          className="section-title font-heading font-black text-white uppercase"
          style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", letterSpacing: "0.06em" }}
        >
          Тарифы
        </h2>
      </div>

      <div className="max-w-5xl mx-auto flex flex-col gap-4">
        {/* row 1: 2 cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {top.map((c) => <TariffCard key={c.id} card={c} />)}
        </div>

        {/* row 2: 3 cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bottom.map((c) => <TariffCard key={c.id} card={c} />)}
        </div>
      </div>
    </section>
  );
}
