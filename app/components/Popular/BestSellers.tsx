"use client";

import { useRef } from "react";
import Image from "next/image";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

type Product = {
  name: string;
  fabric: string;
  price: string;
  was: string;
  image: string;
  tag: string;
  reviews: number;
};

const products: Product[] = [
  { name: "Royal Purple Banarasi Silk Saree", fabric: "Banarasi silk", price: "₹ 8,499", was: "₹ 10,999", image: "photo-1610030469983-98e550d6193c", tag: "BESTSELLER", reviews: 48 },
  { name: "Kanjivaram Gold Zari Saree", fabric: "Kanjivaram silk", price: "₹ 11,999", was: "₹ 14,999", image: "photo-1717835735088-4c821959bdaa", tag: "HANDWOVEN", reviews: 32 },
  { name: "Meenakari Emerald Silk Saree", fabric: "Art silk", price: "₹ 6,999", was: "₹ 8,499", image: "photo-1753981031189-27bb7bd1c079", tag: "CUSTOMER FAVOURITE", reviews: 27 },
  { name: "Rose Garden Georgette Saree", fabric: "Soft georgette", price: "₹ 3,499", was: "₹ 4,299", image: "photo-1617627143750-d86bc21e42bb", tag: "NEW ARRIVAL", reviews: 19 },
  { name: "Rustic Charm Handloom Saree", fabric: "Handloom cotton", price: "₹ 2,299", was: "₹ 2,999", image: "photo-1609748340471-14c1fcbad10d", tag: "HANDWOVEN", reviews: 41 },
  { name: "Bandhani Celebration Saree", fabric: "Bandhani silk", price: "₹ 5,499", was: "₹ 6,799", image: "photo-1745482036050-3d644032416d", tag: "FESTIVE EDIT", reviews: 23 },
  { name: "Mauve Chanderi Buti Saree", fabric: "Chanderi silk", price: "₹ 4,899", was: "₹ 5,999", image: "photo-1717835429626-d6dd3f2c9afb", tag: "LIMITED EDITION", reviews: 16 },
  { name: "Floral Organza Occasion Saree", fabric: "Embroidered organza", price: "₹ 5,999", was: "₹ 7,499", image: "photo-1717835943315-b818e90cb2a1", tag: "OCCASION WEAR", reviews: 21 },
  { name: "Tussar Heritage Saree", fabric: "Tussar silk", price: "₹ 7,499", was: "₹ 9,299", image: "photo-1619516388835-2b60acc4049e", tag: "ARTISAN PICK", reviews: 14 },
  { name: "Patola Inspired Silk Saree", fabric: "Woven silk", price: "₹ 4,299", was: "₹ 5,499", image: "photo-1597897545901-6ac15b725974", tag: "BESTSELLER", reviews: 36 },
  { name: "Mustard Zari Border Saree", fabric: "Silk blend", price: "₹ 8,999", was: "₹ 10,999", image: "photo-1717835735088-4c821959bdaa", tag: "WEDDING EDIT", reviews: 18 },
  { name: "Teal Banarasi Butidar Saree", fabric: "Banarasi silk", price: "₹ 9,499", was: "₹ 11,999", image: "photo-1610030469983-98e550d6193c", tag: "HANDWOVEN", reviews: 29 },
  { name: "Blush Tissue Silk Saree", fabric: "Tissue silk", price: "₹ 7,999", was: "₹ 9,499", image: "photo-1745482036050-3d644032416d", tag: "NEW ARRIVAL", reviews: 12 },
  { name: "Indigo Ajrakh Cotton Saree", fabric: "Printed cotton", price: "₹ 3,899", was: "₹ 4,799", image: "photo-1609748340471-14c1fcbad10d", tag: "ARTISAN PICK", reviews: 25 },
  { name: "Violet Wedding Silk Saree", fabric: "Pure silk", price: "₹ 12,499", was: "₹ 15,999", image: "photo-1717835429626-d6dd3f2c9afb", tag: "WEDDING EDIT", reviews: 17 },
  { name: "Rose Gold Festive Saree", fabric: "Georgette blend", price: "₹ 6,499", was: "₹ 7,999", image: "photo-1717835943315-b818e90cb2a1", tag: "FESTIVE EDIT", reviews: 31 },
  { name: "Midnight Blue Woven Saree", fabric: "Woven silk", price: "₹ 5,999", was: "₹ 7,299", image: "photo-1617627143750-d86bc21e42bb", tag: "CUSTOMER FAVOURITE", reviews: 22 },
  { name: "Green Temple Border Saree", fabric: "Handloom silk", price: "₹ 4,599", was: "₹ 5,699", image: "photo-1753981031189-27bb7bd1c079", tag: "HANDWOVEN", reviews: 28 },
  { name: "Peach Draped Georgette Saree", fabric: "Soft georgette", price: "₹ 3,799", was: "₹ 4,699", image: "photo-1745482036050-3d644032416d", tag: "EASY DRAPE", reviews: 20 },
  { name: "Crimson Bridal Zari Saree", fabric: "Banarasi silk", price: "₹ 13,999", was: "₹ 17,499", image: "photo-1717835735088-4c821959bdaa", tag: "BRIDAL EDIT", reviews: 15 },
  { name: "Sunshine Yellow Cotton Saree", fabric: "Printed cotton", price: "₹ 2,699", was: "₹ 3,299", image: "photo-1597897545901-6ac15b725974", tag: "EVERYDAY FAVOURITE", reviews: 37 },
  { name: "Black Gold Evening Saree", fabric: "Silk blend", price: "₹ 7,299", was: "₹ 8,999", image: "photo-1610030469983-98e550d6193c", tag: "OCCASION WEAR", reviews: 24 },
  { name: "Coral Banarasi Festive Saree", fabric: "Banarasi silk", price: "₹ 9,999", was: "₹ 12,499", image: "photo-1717835943315-b818e90cb2a1", tag: "FESTIVE EDIT", reviews: 19 },
  { name: "Lavender Chanderi Saree", fabric: "Chanderi silk", price: "₹ 5,299", was: "₹ 6,499", image: "photo-1619516388835-2b60acc4049e", tag: "NEW ARRIVAL", reviews: 13 },
  { name: "Turquoise Woven Silk Saree", fabric: "Woven silk", price: "₹ 8,299", was: "₹ 10,499", image: "photo-1753981031189-27bb7bd1c079", tag: "HANDWOVEN", reviews: 26 },
  { name: "Leheriya Celebration Saree", fabric: "Printed georgette", price: "₹ 4,499", was: "₹ 5,499", image: "photo-1597897545901-6ac15b725974", tag: "FESTIVE EDIT", reviews: 18 },
  { name: "Ivory Zari Buta Saree", fabric: "Silk blend", price: "₹ 7,899", was: "₹ 9,799", image: "photo-1717835429626-d6dd3f2c9afb", tag: "CUSTOMER FAVOURITE", reviews: 21 },
  { name: "Pink Bloom Organza Saree", fabric: "Floral organza", price: "₹ 5,699", was: "₹ 6,999", image: "photo-1717835943315-b818e90cb2a1", tag: "NEW ARRIVAL", reviews: 11 },
  { name: "Olive Green Cotton Saree", fabric: "Handloom cotton", price: "₹ 3,299", was: "₹ 4,099", image: "photo-1609748340471-14c1fcbad10d", tag: "HANDWOVEN", reviews: 30 },
  { name: "Royal Purple Silk Saree", fabric: "Silk blend", price: "₹ 10,999", was: "₹ 13,499", image: "photo-1610030469983-98e550d6193c", tag: "BESTSELLER", reviews: 44 },
];

const productImage = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=85`;

export default function BestSellers() {
  const rail = useRef<HTMLDivElement>(null);

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
        aria-label="30 best-selling sarees"
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-4"
      >
        {products.map((product, index) => (
          <article
            key={product.name}
            data-product-card
            className="group flex w-[76%] min-w-[230px] shrink-0 snap-start flex-col overflow-hidden rounded-sm border border-[#eadfd8] bg-[#fffdfa] shadow-[0_3px_16px_rgba(43,27,38,0.05)] transition-shadow hover:shadow-[0_12px_30px_rgba(43,27,38,0.13)] sm:w-[47%] md:w-[31%] lg:w-[calc((100%-3rem)/4)] xl:w-[calc((100%-4rem)/5)]"
          >
            <div className="relative aspect-[4/4.8] overflow-hidden bg-[#eee6e0]">
              <Image
                src={productImage(product.image)}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 76vw, (max-width: 1024px) 31vw, 20vw"
                unoptimized
                loading={index < 5 ? "eager" : "lazy"}
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <span className="absolute left-3 top-3 rounded-sm bg-[#fffaf4]/95 px-2.5 py-1.5 text-[7px] font-semibold tracking-[0.12em] text-[#684768] shadow-sm sm:text-[8px]">
                {product.tag}
              </span>
              <span className="absolute bottom-3 right-3 rounded-full bg-[#211821]/75 px-2.5 py-1 text-[8px] text-white backdrop-blur-sm">
                {String(index + 1).padStart(2, "0")} / 30
              </span>
            </div>

            <div className="flex flex-1 flex-col p-3 sm:p-4">
              <span className="text-[8px] font-medium uppercase tracking-[0.16em] text-[#9a778f]">
                {product.fabric}
              </span>
              <h3 className="mt-1.5 min-h-7 font-serif text-[14px] leading-snug text-[#302531] sm:text-[15px]">
                {product.name}
              </h3>
              <div className="flex items-center gap-1.5 text-[10px] text-[#ae8950]">
                <span aria-label="Rated 5 out of 5">★★★★★</span>
                <span className="text-[9px] text-muted">({product.reviews})</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <strong className="text-[13px] font-semibold text-ink">{product.price}</strong>
                <span className="text-[10px] text-muted line-through">{product.was}</span>
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
