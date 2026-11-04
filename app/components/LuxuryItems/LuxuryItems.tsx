import Image from "next/image";

const archClip =
  "polygon(50% 0%, 58% 5%, 74% 7%, 82% 13%, 91% 16%, 97% 23%, 100% 31%, 100% 100%, 0 100%, 0 31%, 3% 23%, 9% 16%, 18% 13%, 26% 7%, 42% 5%)";

const luxuryPieces = [
  {
    name: "Chikankari saree",
    image: "/luxury-items/chikankari-saree.jpg",
    alt: "Model wearing a white embroidered Chikankari saree in a carved courtyard",
    note: "Lucknowi hand embroidery",
    imagePosition: "center 42%",
  },
  {
    name: "Paithani saree",
    image: "/luxury-items/paithani-saree.png",
    alt: "Model wearing a rich blue and orange Paithani silk saree",
    note: "Maharashtra silk heritage",
    imagePosition: "center 35%",
  },
  {
    name: "Frock Salwar suit",
    image: "/luxury-items/frock-salwar.jpg",
    alt: "Model in a vibrant pink flared frock style salwar suit",
    note: "A graceful festive silhouette",
    imagePosition: "center 35%",
  },
  {
    name: "Angarkha Salwar suit",
    image: "/luxury-items/angarkha-salwar.jpg",
    alt: "Model wearing a white and indigo Angarkha salwar suit",
    note: "Classic wrap-front styling",
    imagePosition: "center 35%",
  },
];

export function LuxuryItems() {
  return (
    <section
      aria-labelledby="luxury-items-heading"
      className="relative isolate overflow-hidden bg-[#f8f3ed] px-[5%] py-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(167,125,69,0.09),_transparent_52%)]"
      />

      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-9 max-w-2xl text-center sm:mb-12">
          <p className="text-[9px] font-bold tracking-[0.3em] text-[#a77d45] sm:text-[10px]">
            THE COUTURE COLLECTION
          </p>
          <h3
            id="luxury-items-heading"
            className="mt-1 font-serif text-2xl leading-tight text-[#401d3c] sm:text-3xl md:text-3xl"
          >
            Luxury Items for Luxury Ladies
          </h3>
          <div className="mx-auto mt-1 flex max-w-xs items-center gap-3 text-[#b79263]" aria-hidden="true">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#c8aa7a]" />
            <span className="font-serif text-sm">✦</span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#c8aa7a]" />
          </div>
        </div>

        <div className="grid grid-cols-2 items-start gap-x-3 gap-y-6 sm:gap-x-5 sm:gap-y-8 lg:grid-cols-4 lg:gap-6">
          {luxuryPieces.map((piece) => (
            <article key={piece.name} className="mx-auto w-full max-w-[310px]">
              <div
                className="relative aspect-[0.72] bg-gradient-to-b from-[#d4b36f] via-[#b7924d] to-[#806039] p-[3px] shadow-[0_14px_28px_rgba(64,29,60,0.14)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_20px_36px_rgba(64,29,60,0.2)] sm:p-1"
                style={{ clipPath: archClip }}
              >
                <div
                  className="relative h-full w-full overflow-hidden bg-[#e8ded9]"
                  style={{ clipPath: archClip }}
                >
                  <Image
                    src={piece.image}
                    alt={piece.alt}
                    fill
                    sizes="(max-width: 640px) 44vw, (max-width: 1024px) 30vw, 23vw"
                    className="object-cover transition duration-700 hover:scale-[1.04]"
                    style={{ objectPosition: piece.imagePosition }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#211821]/95 via-[#211821]/15 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 px-2 pb-5 text-center text-white sm:px-4 sm:pb-7">
                    <h3 className="font-serif text-[15px] leading-tight text-[#fff5d9] drop-shadow sm:text-xl lg:text-[19px]">
                      {piece.name}
                    </h3>
                    <p className="mt-1.5 text-[7px] font-medium tracking-[0.08em] text-white/75 sm:text-[9px] sm:tracking-[0.13em]">
                      {piece.note}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
