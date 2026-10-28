"use client";

import Image from "next/image";
import { useState } from "react";
import { FiStar } from "react-icons/fi";

export type SareeProduct = {
  id: string;
  name: string;
  fabric: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  label: string;
};

type Props = {
  title: string;
  editTitle: string;
  description: string;
  heroImage: string;
  products: SareeProduct[];
};

export default function SareeCollection({
  title,
  editTitle,
  description,
  heroImage,
  products,
}: Props) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [message, setMessage] = useState("");

  const addToBag = (product: SareeProduct) => {
    setCart((current) => ({
      ...current,
      [product.id]: (current[product.id] ?? 0) + 1,
    }));
    setMessage(`${product.name} added to your bag`);
    window.setTimeout(() => setMessage(""), 2200);
  };

  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#2d242d]">
      <section className="relative isolate overflow-hidden bg-[#281b26] text-white">
        <Image
          src={heroImage}
          alt={`${title} collection`}
          fill
          priority
          unoptimized
          className="-z-20 object-cover object-center opacity-45"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#211821]/95 via-[#211821]/75 to-[#211821]/35" />
        <div className="mx-auto max-w-6xl px-[6%] pb-12 pt-32 sm:pb-16 sm:pt-25">
          <span className="text-[9px] font-semibold tracking-[0.28em] text-[#e3bfd8]">
            THE SONI SAREE EDIT
          </span>
          <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl md:text-6xl">
            {title}
          </h1>
          <p className="mt-3 max-w-xl text-[11px] leading-6 text-white/75 sm:text-sm">
            {description}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-[5%] py-8 sm:px-[6%] sm:py-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <span className="text-[8px] font-semibold tracking-[0.24em] text-[#986d8f]">
              CURATED FOR YOU
            </span>
            <h2 className="mt-1 font-serif text-2xl sm:text-3xl">
              The {editTitle} edit
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product, index) => (
            <article
              key={product.id}
              className="group flex flex-col overflow-hidden border border-[#e9e0d9] bg-white shadow-[0_4px_18px_rgba(43,27,38,0.045)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(43,27,38,0.12)]"
            >
              <div className="relative aspect-[4/4.8] overflow-hidden bg-[#eee6e0]">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                  unoptimized
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.045]"
                />
                <span className="absolute left-2.5 top-2.5 bg-[#fffaf4]/95 px-2 py-1.5 text-[7px] font-semibold tracking-[0.12em] text-[#684768] shadow-sm sm:left-3 sm:top-3 sm:px-2.5 sm:text-[8px]">
                  {product.label}
                </span>
                <span className="absolute bottom-2.5 right-2.5 rounded-full bg-[#211821]/75 px-2.5 py-1 text-[8px] text-white backdrop-blur-sm">
                  {String(index + 1).padStart(2, "0")} /{" "}
                  {String(products.length).padStart(2, "0")}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-3 sm:p-4">
                <span className="text-[7px] font-medium uppercase tracking-[0.15em] text-[#9a778f] sm:text-[8px]">
                  {product.fabric}
                </span>
                <h3 className="mt-1 min-h-7 font-serif text-[13px] leading-snug text-[#302531] sm:min-h-7 sm:text-[15px]">
                  {product.name}
                </h3>
                <div className="flex items-center gap-1.5 text-[9px] text-[#ae8950] sm:text-[10px]">
                  <span
                    aria-label={`Rated ${product.rating} out of 5`}
                    className="inline-flex items-center gap-0.5"
                  >
                    <FiStar
                      aria-hidden="true"
                      className="fill-current"
                      size={11}
                    />{" "}
                    {product.rating.toFixed(1)}
                  </span>
                  <span className="text-[8px] text-[#777078] sm:text-[9px]">
                    ({product.reviews} reviews)
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <strong className="text-[12px] font-semibold text-[#251c25] sm:text-[13px]">
                    ₹{product.price.toLocaleString("en-IN")}
                  </strong>
                  <span className="text-[9px] text-[#777078] line-through">
                    ₹{Math.round(product.price * 1.2).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="mt-auto grid grid-cols-2 gap-1.5 pt-3 sm:gap-2 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => addToBag(product)}
                    className="min-h-9 rounded-sm bg-[#30172f] px-1.5 text-[8px] font-semibold tracking-wide text-white transition hover:bg-[#593153] sm:min-h-10 sm:px-2 sm:text-[10px]"
                  >
                    Buy now
                  </button>
                  <button
                    type="button"
                    onClick={() => addToBag(product)}
                    className="min-h-9 rounded-sm border border-[#cbb8c8] px-1.5 text-[8px] font-semibold tracking-wide text-[#30172f] transition hover:border-[#30172f] hover:bg-[#f6eef4] sm:min-h-10 sm:px-2 sm:text-[10px]"
                  >
                    {cart[product.id]
                      ? `Add again (${cart[product.id]})`
                      : "Add to bag"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div
        aria-live="polite"
        className={`fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#30172f] px-5 py-3 text-center text-[11px] text-white shadow-xl transition-all ${message ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}
      >
        {message}
      </div>
    </main>
  );
}
