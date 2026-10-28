import Image from "next/image";

const collections = [
  {
    eyebrow: "CLASSIC INDIAN MENSWEAR",
    title: "Kurta Pajama",
    description: "Easy elegance for celebrations, family gatherings and every special moment.",
    image: "https://stuffieland.in/cdn/shop/files/82A7452_7376329d-6ed2-4082-a432-714f7be5417a.jpg?v=1744186833&width=1400",
    alt: "Men's white kurta pajama set styled for a traditional occasion",
    position: "object-[center_30%]",
  },
  {
    eyebrow: "TAILORED FOR HIM",
    title: "Safari Suit",
    description: "A confident, timeless silhouette featuring trusted suiting from Raymond and Siyaram’s.",
    image: "https://i.etsystatic.com/60165082/r/il/cedb4d/7092086841/il_1080xN.7092086841_f2mh.jpg",
    alt: "Man wearing a tailored beige safari suit with classic four-pocket styling",
    position: "object-[center_28%]",
  },
];

export default function Mens() {
  return (
    <section id="menswear" className="mx-auto max-w-6xl px-[5%] pb-8 pt-5 md:px-0">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <span className="text-[9px] font-bold tracking-[0.24em] text-[#986d8f]">THE MENSWEAR EDIT</span>
          <h2 className="mt-2 font-serif text-2xl leading-tight tracking-tight sm:text-3xl">A finer fit for him</h2>
        </div>
        <span className="hidden pb-1 font-serif text-sm italic text-[#9a8495] sm:block">Tradition, tailored</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
        {collections.map((collection) => (
          <article key={collection.title} className="group relative isolate flex h-[300px] items-end overflow-hidden bg-[#392c32] text-white sm:h-[340px] md:h-[370px]">
            <Image
              src={collection.image}
              alt={collection.alt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              unoptimized
              className={`-z-20 object-cover ${collection.position} transition duration-700 group-hover:scale-[1.04]`}
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#211821]/90 via-[#211821]/30 to-transparent" />
            <div className="relative max-w-lg p-5 sm:p-7 md:p-8">
              <span className="text-[8px] font-semibold tracking-[0.2em] text-[#f0d6b7]">{collection.eyebrow}</span>
              <h3 className="mt-2 font-serif text-3xl leading-tight sm:text-4xl">{collection.title}</h3>
              <p className="mt-2 max-w-sm text-[10px] leading-relaxed text-white/80 sm:text-xs">{collection.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
