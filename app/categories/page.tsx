import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import banarshiSaree from "../assets/SareeSection/Banarshi-silk.avif";
import bandhaniSaree from "../assets/SareeSection/Bandhani-Saree.avif";
import cottonSaree from "../assets/SareeSection/Cotton-Saree.avif";
import festivalSaree from "../assets/SareeSection/Festival-Saree.avif";
import georgetteSaree from "../assets/SareeSection/Georgette-Saree.avif";
import kanjivaramSaree from "../assets/SareeSection/Kanjivaram-Saree.avif";

export const metadata: Metadata = {
  title: "Shop by Category | Soni Saree Showroom",
  description:
    "Explore sarees, women's suits, and traditional Rajputi poshak at Soni Saree Showroom.",
};

const image = (id: string, width = 580) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

const collections = [
  {
    id: "sarees",
    eyebrow: "TIMELESS DRAPES",
    title: "Sarees",
    description: "Artful weaves and graceful drapes for every occasion.",
    items: [
      { name: "Banarasi Silk", image: banarshiSaree, href: "/category/saree/banarshi" },
      { name: "Kanjivaram Silk", image: kanjivaramSaree, href: "/category/saree/kanjivaram" },
      { name: "Cotton & Handloom", image: cottonSaree, href: "/category/saree/cotton" },
      { name: "Georgette & Chiffon", image: georgetteSaree, href: "/category/saree/georgette" },
      { name: "Bandhani", image: bandhaniSaree, href: "/category/saree/bandhani" },
      { name: "Festive & Occasion", image: festivalSaree, href: "/category/saree/festival" },
    ],
  },
  {
    id: "suits",
    eyebrow: "EASY ELEGANCE",
    title: "Suits",
    description: "Beautifully considered sets for celebrations and everyday.",
    items: [
      { name: "Anarkali Suits", image: "photo-1705921290980-6a644d2828ed" },
      { name: "Straight Suit Sets", image: "photo-1742800767764-479556a4d8a5" },
      { name: "Sharara Sets", image: "photo-1705921290980-6a644d2828ed" },
      { name: "Punjabi Suits", image: "photo-1742800767764-479556a4d8a5" },
      { name: "Festive Embroidery", image: "photo-1705921290980-6a644d2828ed" },
      { name: "Cotton Suits", image: "photo-1742800767764-479556a4d8a5" },
    ],
  },
  {
    id: "rajputi-poshak",
    eyebrow: "ROYAL RAJASTHANI CRAFT",
    title: "Rajputi Poshak",
    description: "Heritage dressing with the color and detail of Rajasthan.",
    items: [
      { name: "Traditional Poshak", image: "photo-1610030469983-98e550d6193c" },
      { name: "Leheriya Poshak", image: "photo-1753981031189-27bb7bd1c079" },
      { name: "Gota Patti Poshak", image: "photo-1717835429626-d6dd3f2c9afb" },
      { name: "Bridal Poshak", image: "photo-1717835735088-4c821959bdaa" },
    ],
  },
];

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#2d242d]">
      <Header />

      <section className="relative isolate overflow-hidden bg-[#281b26] text-white">
        <Image
          src={banarshiSaree}
          alt="Traditional Indian saree in rich festive colors"
          fill
          sizes="100vw"
          unoptimized
          className="-z-20 object-cover object-center opacity-45"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#211821]/85 via-[#211821]/75 to-[#211821]/35" />
        <div className="mx-auto max-w-6xl px-[6%] pb-12 pt-32 sm:pb-16 sm:pt-25">
          <span className="text-[9px] font-semibold tracking-[0.28em] text-[#e3bfd8]">
            FIND YOUR KIND OF BEAUTIFUL
          </span>
          <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl md:text-6xl">
            Shop by category
          </h1>
          <p className="mt-3 max-w-xl text-[11px] leading-6 text-white/75 sm:text-sm">
            From treasured sarees to festive suits and Rajputi poshak, explore
            pieces for every celebration and every day.
          </p>
        </div>
      </section>

      <nav aria-label="Category sections" className="border-b border-[#e8dfd7] bg-[#fbf8f3]">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-8 gap-y-1 px-[6%] py-3 text-[13px] font-medium tracking-wide sm:gap-x-12 sm:py-4 sm:text-sm md:text-[15px]">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`#${collection.id}`}
              className="group relative shrink-0 py-2 text-[#5d4a59] transition-colors hover:text-[#9a6f91] after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-[#9a6f91] after:transition-transform after:duration-300 after:content-[''] hover:after:origin-left hover:after:scale-x-100"
            >
              {collection.title}
            </Link>
          ))}
        </div>
      </nav>

      <div className="mx-auto mb-5 max-w-6xl px-[6%] pt-5">
        {collections.map((collection, sectionIndex) => (
          <section
            key={collection.id}
            id={collection.id}
            className={sectionIndex === 0 ? "scroll-mt-8" : "mt-12 scroll-mt-8 sm:mt-10"}
          >
            <div className="mb-5 flex items-end justify-between gap-4 sm:mb-7">
              <div>
                <span className="text-[8px] font-semibold tracking-[0.23em] text-[#986d8f]">
                  {collection.eyebrow}
                </span>
                <h2 className="mt-2 font-serif text-3xl leading-none sm:text-4xl">
                  {collection.title}
                </h2>
                <p className="mt-2 text-[10px] text-muted sm:text-xs">
                  {collection.description}
                </p>
              </div>
              <span className="hidden shrink-0 pb-1 font-serif text-sm italic text-[#9a8495] sm:block">
                {String(sectionIndex + 1).padStart(2, "0")} / 03
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {collection.items.map((item, itemIndex) => (
                <article
                  key={item.name}
                  className="group relative isolate aspect-[4/4.8] overflow-hidden bg-[#e8ded9]"
                >
                  <Image
                    src={typeof item.image === "string" ? image(item.image) : item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    unoptimized
                    className="-z-20 object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#211821]/75 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 text-white sm:p-4">
                    <h3 className="font-serif text-base leading-tight sm:text-lg">
                      {item.name}
                    </h3>
                    <span className="shrink-0 text-[8px] tracking-widest text-white/70">
                      {String(itemIndex + 1).padStart(2, "0")}
                    </span>
                  </div>
                  {collection.id === "sarees" && "href" in item && (
                    <Link
                      href={item.href}
                      aria-label={`Shop ${item.name} sarees`}
                      className="absolute inset-0 z-10"
                    />
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <Footer />
    </main>
  );
}
