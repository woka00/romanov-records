// ROMANOV RECORDS — Комфорт + Звук section (server component, no interactivity needed)
// LAYOUT: asymmetric grid — top row 3 cols, bottom row 2 cols
//   Cards: Лаунж зона с PlayStation | Молодые звукорежи | Атмосфера без напряга
//          Сведение / Обработка      | Дорогое железо и чистый звук
// Style: cream bg cards (light), hover: scale-up subtle

interface ComfortCard {
  id: string;
  title: string;
  body: string;
  span?: string;
}

const CARDS: ComfortCard[] = [
  {
    id: "lounge",
    title: "Лаундж зона\nс PlayStation",
    body: "Между дублями можно выдохнуть. Диван, большой телевизор, PlayStation — никто не косит глазом, если вы решите переключиться на пару минут. Напитки сами берёте из холодильника, мы не считаем.",
  },
  {
    id: "engineers",
    title: "Молодые звукорежи,\nно с реальным опытом",
    body: "Им за 20-30, но руки помнят не только вузовскую теорию. Сами записывают музыку, знают, что такое правки в час ночи и волнение перед микрофоном. Не будут читать нотации, но предложат дельный вариант, если что-то идёт не так.",
  },
  {
    id: "atmosphere",
    title: "Атмосфера\nбез напряга",
    body: "Никто не стоит над душой с секундомером. Если вокалисту нужно 10 минут разогреться — без проблем. Запороли дубль? Давайте ещё раз. Флип-флопы, айфон на стойке, смех в лаунже — это норма. Главное, чтобы в итоге трек нравился вам.",
  },
  {
    id: "mixing",
    title: "Сведение / Обработка,\nчтобы «зазвучало»",
    body: "Не «вытянем за уши», а сделаем так, чтобы трек держал громкость и не разваливался на колонках. Никаких магических пресетов — просто аккуратная работа с балансом, частотами и динамикой. Результат, который не стыдно сбросить друзьям до релиза.",
  },
  {
    id: "gear",
    title: "Дорогое железо\nи чистый звук",
    body: "Neumann, Universal Audio, Shure SM7B, U 87 — всё перечислять долго. Комната спроектирована без лишних отражений, поэтому вы слышите голос или инструмент, а не «гул ванной». Чистый сигнал, с которым потом легко работать при сведении.",
  },
];

export default function Comfort() {
  const topRow = CARDS.slice(0, 3);
  const bottomRow = CARDS.slice(3);
  const mobileCards = [
    CARDS[1],
    CARDS[0],
    CARDS[2],
    CARDS[4],
    CARDS[3],
  ];

  return (
    <section id="comfort" className="comfort-section relative py-20 px-4 sm:px-8 pb-24">
      {/* section title */}
      <div className="comfort-title-wrap flex justify-center mb-12">
        <h2
          className="section-title font-heading font-black text-white uppercase"
          style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", letterSpacing: "0.06em" }}
        >
          Комфорт + Звук
        </h2>
      </div>

      <div className="hidden md:flex max-w-5xl mx-auto flex-col gap-4">
        {/* row 1: 3 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {topRow.map((card) => (
            <ComfortCardEl key={card.id} card={card} />
          ))}
        </div>

        {/* row 2: 2 cards (centered, wider) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {bottomRow.map((card) => (
            <ComfortCardEl key={card.id} card={card} />
          ))}
        </div>
      </div>

      <div className="comfort-mobile-list md:hidden">
        {mobileCards.map((card, index) => (
          <ComfortCardEl
            key={card.id}
            card={card}
            variant={index === 1 || index === 4 ? "light" : "dark"}
          />
        ))}
      </div>
    </section>
  );
}

function ComfortCardEl({
  card,
  variant = "dark",
}: {
  card: ComfortCard;
  variant?: "dark" | "light";
}) {
  return (
    <div
      className={`comfort-card comfort-card-${variant} rounded-3xl p-6 flex flex-col gap-3 cursor-default
                 transition-transform duration-300 hover:scale-[1.02]
      `}
      style={{
        background: "rgba(7,56,53,0.45)",
        border: "1px solid rgba(255,255,255,0.10)",
      }}
    >
      <h3
        className="font-heading font-black text-white leading-tight uppercase"
        style={{ fontSize: "1.05rem", letterSpacing: "0.02em", whiteSpace: "pre-line" }}
      >
        {card.title}
      </h3>
      <p className="font-body text-white/65 text-sm leading-relaxed">{card.body}</p>
    </div>
  );
}
