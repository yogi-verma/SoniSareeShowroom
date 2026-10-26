import Image from "next/image";

const photos = {
  handloom:
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=85",
  banarasi:
    "https://images.unsplash.com/photo-1717835735088-4c821959bdaa?auto=format&fit=crop&w=1200&q=85",
  offer:
    "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1800&q=85",
};

export default function Trends() {
  return (
    <section id="story" className="mx-auto max-w-[1440px] px-[5%] pb-2 pt-7 md:pt-12">
      <div className="mb-5 flex items-end justify-between md:mb-7">
        <div>
          <span className="text-[8px] font-semibold tracking-[0.24em] text-[#986d8f]">
            THE SONI EDIT
          </span>
          <h2 className="mt-2 font-serif text-2xl leading-tight tracking-tight sm:text-3xl md:text-4xl">
            Made for your moments
          </h2>
        </div>
        <span className="hidden pb-1 text-[9px] tracking-[0.17em] text-muted sm:block">
          CRAFTED WITH MEANING
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.25fr_.75fr] md:gap-4">
        <article className="group relative isolate flex min-h-[340px] items-end overflow-hidden bg-[#392c32] text-white sm:min-h-[390px] md:min-h-[440px]">
          <Image
            src={photos.handloom}
            alt="Traditional silk saree with intricate gold weaving"
            fill
            sizes="(max-width: 768px) 100vw, 65vw"
            unoptimized
            className="-z-20 object-cover object-[center_35%] transition duration-700 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#1b1218]/90 via-[#1b1218]/28 to-transparent" />
          <div className="absolute right-5 top-5 hidden items-center gap-2 rounded-full border border-white/40 bg-black/10 px-3 py-2 text-[8px] tracking-[0.16em] text-white/90 backdrop-blur-sm sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d9b5cf]" />
            TIMELESS BY NATURE
          </div>
          <div className="relative max-w-xl p-6 sm:p-8 md:p-10">
            <span className="text-[8px] font-semibold tracking-[0.23em] text-[#e3bfd8]">
              HANDLOOM CLASSICS
            </span>
            <h3 className="mt-3 font-serif text-3xl leading-[1.05] sm:text-4xl md:text-5xl">
              Woven with<br className="hidden sm:block" /> a story.
            </h3>
            <p className="mt-3 max-w-sm text-[11px] leading-5 text-white/75 sm:text-xs">
              Discover the character and beauty of India’s treasured weaves.
            </p>
            <a
              href="#shop"
              className="mt-5 inline-flex min-h-10 items-center gap-5 border-b border-white/70 pb-1 text-[9px] font-semibold tracking-[0.16em] transition-colors hover:border-[#e3bfd8] hover:text-[#e3bfd8]"
            >
              EXPLORE HANDLOOMS <span aria-hidden="true" className="text-base">→</span>
            </a>
          </div>
        </article>

        <article className="group relative isolate flex min-h-[300px] items-end overflow-hidden bg-[#3b2339] text-white sm:min-h-[340px] md:min-h-[440px]">
          <Image
            src={photos.banarasi}
            alt="Model wearing a richly colored traditional saree"
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            unoptimized
            className="-z-20 object-cover object-center transition duration-700 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#261329]/90 via-[#261329]/32 to-[#261329]/5" />
          <div className="relative p-6 sm:p-8 md:p-9">
            <span className="text-[8px] font-semibold tracking-[0.23em] text-[#e3bfd8]">
              THE FESTIVE EDIT
            </span>
            <h3 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">
              A Banarasi<br />
              kind of moment.
            </h3>
            <p className="mt-3 max-w-xs text-[11px] leading-5 text-white/75 sm:text-xs">
              Rich texture, luminous color, unforgettable presence.
            </p>
            <a
              href="#shop"
              className="mt-5 inline-flex min-h-10 items-center gap-3 rounded-sm border border-white/60 px-4 text-[9px] font-semibold tracking-[0.14em] transition hover:border-white hover:bg-white hover:text-[#30172f]"
            >
              SHOP BANARASI <span aria-hidden="true" className="text-base">→</span>
            </a>
          </div>
        </article>
      </div>

      <div className="relative isolate mt-4 flex min-h-[190px] items-center justify-between gap-5 overflow-hidden bg-[#291b29] px-6 py-7 text-white sm:px-10 md:mt-6 md:min-h-[220px] md:px-14">
        <Image
          src={photos.offer}
          alt=""
          fill
          sizes="100vw"
          unoptimized
          className="-z-20 object-cover object-[center_42%]"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#291629]/95 via-[#291629]/78 to-[#291629]/35" />
        <div className="relative max-w-lg">
          <span className="text-[8px] font-semibold tracking-[0.24em] text-[#dfb9d5]">
            A WELCOME FROM US
          </span>
          <h2 className="mt-2 font-serif text-2xl leading-tight sm:text-3xl md:text-4xl">
            Your first order,<br className="sm:hidden" /> a little more special.
          </h2>
          <p className="mt-2 text-[10px] tracking-wide text-white/75 sm:text-xs">
            Enjoy 10% off your first order.
          </p>
        </div>
        <div className="relative shrink-0 text-center">
          <span className="mb-2 block text-[8px] tracking-[0.18em] text-white/70">
            USE CODE
          </span>
          <span className="inline-flex min-h-11 items-center rounded-sm border border-white/60 px-3 text-[9px] font-semibold tracking-[0.16em] sm:px-5 sm:text-[10px]">
            WELCOME10
          </span>
        </div>
      </div>
    </section>
  );
}
