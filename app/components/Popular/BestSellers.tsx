"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

type Product = {
  _id: string;
  productType: "saree";
  category: string;
  name: string;
  price: number;
  stock: number;
  photo: { url: string };
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function BestSellers() {
  const rail = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/catalog/products?productType=saree", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || "Could not load sarees.");
        setProducts(result.products ?? []);
      })
      .catch((loadError: unknown) => {
        if (controller.signal.aborted) return;
        setError(loadError instanceof Error ? loadError.message : "Could not load sarees.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  const scrollCards = (direction: -1 | 1) => {
    const element = rail.current;
    const card = element?.querySelector<HTMLElement>("[data-product-card]");
    if (!element || !card) return;

    const gap = Number.parseFloat(window.getComputedStyle(element).columnGap) || 0;
    element.scrollBy({
      left: direction * (card.getBoundingClientRect().width + gap),
      behavior: "smooth",
    });
  };

  return (
    <section id="shop" className="mx-auto max-w-6xl px-[5%] pb-3 pt-2 md:px-0 md:pb-3">
      <div className="mb-4 flex items-end justify-between gap-4 sm:mb-4">
        <div>
          <span className="text-[9px] font-bold tracking-[0.24em] text-[#986d8f]">
            BEST SELLERS
          </span>
          <h2 className="mt-2 font-serif text-2xl leading-tight sm:text-2xl">
            Loved by Many
          </h2>
        </div>
        <div className="mb-1 flex shrink-0 gap-2">
          <button
            type="button"
            aria-label="Scroll to previous sarees"
            onClick={() => scrollCards(-1)}
            className="grid h-10 w-10 place-items-center rounded-full border border-[#d9cbd4] text-[#503b4f] transition hover:border-plum hover:bg-plum hover:text-white"
          >
            <FiArrowLeft aria-hidden="true" size={16} />
          </button>
          <button
            type="button"
            aria-label="Scroll to more sarees"
            onClick={() => scrollCards(1)}
            className="grid h-10 w-10 place-items-center rounded-full border border-[#d9cbd4] text-[#503b4f] transition hover:border-plum hover:bg-plum hover:text-white"
          >
            <FiArrowRight aria-hidden="true" size={16} />
          </button>
        </div>
      </div>

      <div
        ref={rail}
        aria-label="Saree collection"
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-4"
      >
        {isLoading ? (
          Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="w-[76%] min-w-[230px] shrink-0 overflow-hidden rounded-sm border border-[#eadfd8] bg-[#fffdfa] sm:w-[47%] md:w-[31%] lg:w-[calc((100%-3rem)/4)] xl:w-[calc((100%-4rem)/5)]">
              <div className="aspect-[4/4.8] animate-pulse bg-[#eee6e0]" />
              <div className="space-y-2 p-4"><div className="h-3 w-3/4 animate-pulse bg-[#eee6e0]" /><div className="h-3 w-1/2 animate-pulse bg-[#f3efeb]" /></div>
            </div>
          ))
        ) : error ? (
          <p role="alert" className="py-8 text-sm text-[#a13d39]">{error}</p>
        ) : products.length === 0 ? (
          <p className="py-8 text-sm text-muted">No sarees are available right now.</p>
        ) : products.map((product, index) => (
          <article
            key={product._id}
            data-product-card
            className="group flex w-[76%] min-w-[230px] shrink-0 snap-start flex-col overflow-hidden rounded-sm border border-[#eadfd8] bg-[#fffdfa] shadow-[0_3px_16px_rgba(43,27,38,0.05)] transition-shadow hover:shadow-[0_12px_30px_rgba(43,27,38,0.13)] sm:w-[47%] md:w-[31%] lg:w-[calc((100%-3rem)/4)] xl:w-[calc((100%-4rem)/5)]"
          >
            <div className="relative aspect-[4/4.8] overflow-hidden bg-[#eee6e0]">
              <Image
                src={product.photo.url}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 76vw, (max-width: 1024px) 31vw, 20vw"
                unoptimized
                loading={index < 5 ? "eager" : "lazy"}
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <span className="absolute left-3 top-3 rounded-sm bg-[#fffaf4]/95 px-2.5 py-1.5 text-[7px] font-semibold tracking-[0.12em] text-[#684768] shadow-sm sm:text-[8px]">
                {product.category}
              </span>
              <span className="absolute bottom-3 right-3 rounded-full bg-[#211821]/75 px-2.5 py-1 text-[8px] text-white backdrop-blur-sm">
                {String(index + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")}
              </span>
            </div>

            <div className="flex flex-1 flex-col p-3 sm:p-4">
              <span className={`text-[8px] font-medium uppercase tracking-[0.16em] ${product.stock > 0 ? "text-[#54745f]" : "text-[#a13d39]"}`}>
                {product.stock > 0 ? `${product.stock} IN STOCK` : "OUT OF STOCK"}
              </span>
              <h3 className="mt-1.5 min-h-7 font-serif text-[14px] leading-snug text-[#302531] sm:text-[15px]">
                {product.name}
              </h3>
              <div className="mt-2 flex items-baseline gap-2">
                <strong className="text-[13px] font-semibold text-ink">{formatPrice(product.price)}</strong>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="min-h-10 rounded-sm bg-plum px-2 text-[9px] font-semibold tracking-wide text-white transition hover:bg-[#593153] sm:text-[10px]"
                >
                  Buy Now
                </button>
                <button
                  type="button"
                  className="min-h-10 rounded-sm border border-[#cbb8c8] px-2 text-[9px] font-semibold tracking-wide text-plum transition hover:border-plum hover:bg-[#f6eef4] sm:text-[10px]"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
