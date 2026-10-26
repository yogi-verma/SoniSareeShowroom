import Image from "next/image";

const photos = {
  handloom:
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1400&q=85",
  banarasi:
    "https://images.unsplash.com/photo-1717835735088-4c821959bdaa?auto=format&fit=crop&w=1100&q=85",
  poshak:
    "https://images.unsplash.com/photo-1717835429626-d6dd3f2c9afb?auto=format&fit=crop&w=1100&q=85",
  suits:
    "https://images.unsplash.com/photo-1742800767764-479556a4d8a5?auto=format&fit=crop&w=1400&q=85",
  offer:
    "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1800&q=85",
};

const collections = [
  {
    eyebrow: "HANDLOOM CLASSICS",
    title: "Woven with a story.",
    description: "Discover the character and beauty of India’s treasured weaves.",
    action: "EXPLORE HANDLOOMS",
    image: photos.handloom,
    alt: "Traditional silk saree with intricate gold weaving",
    width: "wide",
    position: "object-[center_35%]",
    overlay: "from-[#1b1218]/90 via-[#1b1218]/25 to-transparent",
  },
  {
    eyebrow: "THE FESTIVE EDIT",
    title: "A Banarasi kind of moment.",
    description: "Rich texture, luminous color, unforgettable presence.",
    action: "SHOP BANARASI",
    image: photos.banarasi,
    alt: "Model wearing a richly colored traditional saree",
    width: "narrow",
    position: "object-center",
    overlay: "from-[#261329]/90 via-[#261329]/35 to-transparent",
  },
  {
    eyebrow: "ROYAL RAJASTHANI CRAFT",
    title: "A little royal, every day.",
    description: "Celebrate the vibrant heritage of Rajputi poshak.",
    action: "DISCOVER POSHAK",
    image: photos.poshak,
    alt: "Traditional red and gold Indian attire",
    width: "narrow",
    position: "object-center",
    overlay: "from-[#261329]/90 via-[#261329]/35 to-transparent",
  },
  {
    eyebrow: "MADE FOR THE CELEBRATION",
    title: "Your moment. Your style.",
    description: "Find your festive favorite in beautifully detailed suits.",
    action: "EXPLORE SUITS",
    image: photos.suits,
    alt: "Model wearing a red floral Indian suit with a flowing dupatta",
    width: "wide",
    position: "object-[center_35%]",
    overlay: "from-[#1b1218]/90 via-[#1b1218]/30 to-transparent",
  },
];

export default function Trends() {
  return (
    <section id="story" className="mx-auto max-w-6xl px-[5%] pb-3 pt-2 md:px-0 md:pb-3">
      <div className="mb-4 flex items-end justify-between md:mb-4">
        <div>
          <span className="text-[9px] font-bold tracking-[0.24em] text-[#986d8f]">
            THE SONI EDIT
          </span>
          <h2 className="mt-2 font-serif text-2xl leading-tight tracking-tight sm:text-3xl">
            Made for your moments
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-12">
        {collections.map((collection) => (
          <article
            key={collection.eyebrow}
            className={`group relative isolate flex h-[245px] items-end overflow-hidden bg-[#392c32] text-white sm:h-[265px] md:h-[300px] ${
              collection.width === "wide" ? "md:col-span-7" : "md:col-span-5"
            }`}
          >
            <Image
              src={collection.image}
              alt={collection.alt}
              fill
              sizes={
                collection.width === "wide"
                  ? "(max-width: 768px) 100vw, 60vw"
                  : "(max-width: 768px) 100vw, 40vw"
              }
              unoptimized
              className={`-z-20 object-cover ${collection.position} transition duration-700 group-hover:scale-[1.04]`}
            />
            <div
              className={`absolute inset-0 -z-10 bg-gradient-to-t ${collection.overlay}`}
            />
            <div className="relative max-w-xl p-5 sm:p-7 md:p-8">
              <span className="text-[7px] font-semibold tracking-[0.2em] text-[#e3bfd8] sm:text-[8px]">
                {collection.eyebrow}
              </span>
              <h3 className="mt-2 max-w-sm font-serif text-2xl leading-[1.08] sm:text-3xl">
                {collection.title}
              </h3>
              <p className="mt-2 max-w-sm text-[9px] leading-relaxed text-white/75 sm:text-[10px]">
                {collection.description}
              </p>
              <a
                href="#shop"
                className="mt-3 inline-flex min-h-8 items-center gap-3 border-b border-white/60 pb-1 text-[8px] font-semibold tracking-[0.14em] transition-colors hover:border-[#e3bfd8] hover:text-[#e3bfd8] sm:mt-4 sm:text-[9px]"
              >
                {collection.action}
                <span aria-hidden="true" className="text-sm">→</span>
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
