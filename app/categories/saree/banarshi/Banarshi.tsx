"use client";

import Image from "next/image";
import { useState } from "react";
import { FiStar } from "react-icons/fi";

type Saree = {
  id: string;
  name: string;
  fabric: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  label: string;
};

const products: Saree[] = [
  { id: "banarshi-royal-purple", name: "Royal Purple Zari Banarshi", fabric: "Banarshi silk · Handwoven zari", price: 8499, rating: 4.9, reviews: 48, image: "photo-1610030469983-98e550d6193c", label: "BESTSELLER" },
  { id: "banarshi-crimson-meenakari", name: "Crimson Meenakari Silk", fabric: "Pure silk · Meenakari weave", price: 10999, rating: 4.8, reviews: 32, image: "photo-1717835735088-4c821959bdaa", label: "HANDWOVEN" },
  { id: "banarshi-teal-butidar", name: "Teal Butidar Banarshi", fabric: "Banarshi silk · Gold buti", price: 9499, rating: 4.8, reviews: 29, image: "photo-1753981031189-27bb7bd1c079", label: "ARTISAN PICK" },
  { id: "banarshi-rose-tissue", name: "Rose Gold Tissue Silk", fabric: "Tissue silk · Zari border", price: 7999, rating: 4.7, reviews: 24, image: "photo-1745482036050-3d644032416d", label: "NEW ARRIVAL" },
  { id: "banarshi-blue-kadhwa", name: "Midnight Blue Kadhwa", fabric: "Kadhwa silk · Brocade pallu", price: 12499, rating: 4.9, reviews: 37, image: "photo-1617627143750-d86bc21e42bb", label: "WEDDING EDIT" },
  { id: "banarshi-coral-jaal", name: "Coral Floral Jaal Saree", fabric: "Banarshi silk · Floral jaal", price: 9999, rating: 4.7, reviews: 21, image: "photo-1717835943315-b818e90cb2a1", label: "FESTIVE FAVOURITE" },
  { id: "banarshi-emerald-zari", name: "Emerald Heritage Zari", fabric: "Silk blend · Antique zari", price: 8999, rating: 4.8, reviews: 26, image: "photo-1717835429626-d6dd3f2c9afb", label: "TIMELESS WEAVE" },
  { id: "banarshi-ivory-buta", name: "Ivory Antique Zari Buta", fabric: "Banarshi silk · Woven buta", price: 11499, rating: 4.9, reviews: 18, image: "photo-1619516388835-2b60acc4049e", label: "LIMITED EDITION" },
  { id: "banarshi-ruby-bridal", name: "Ruby Red Bridal Silk", fabric: "Pure silk · Bridal brocade", price: 14999, rating: 5.0, reviews: 15, image: "photo-1597897545901-6ac15b725974", label: "BRIDAL EDIT" },
  { id: "banarshi-mustard-brocade", name: "Mustard Grand Brocade", fabric: "Banarshi silk · Zari pallu", price: 10499, rating: 4.8, reviews: 22, image: "photo-1609748340471-14c1fcbad10d", label: "SONI PICK" },
];

type Cart = Record<string, number>;

export default function Banarshi() {
  const [cart, setCart] = useState<Cart>({});
  const [message, setMessage] = useState("");


  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#2d242d]">
      <section className="relative isolate overflow-hidden bg-[#281b26] text-white">
        <Image
          src="https://images.unsplash.com/photo-1717835735088-4c821959bdaa?auto=format&fit=crop&w=1800&q=85"
          alt="Traditional Banarshi silk saree with ornate zari work"
          fill
          priority
          unoptimized
          className="-z-20 object-cover object-center opacity-45"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#211821]/95 via-[#211821]/75 to-[#211821]/35" />
        <div className="mx-auto max-w-6xl px-[6%] pb-12 pt-32 sm:pb-16 sm:pt-25">
          <span className="text-[9px] font-semibold tracking-[0.28em] text-[#e3bfd8]">THE SONI SAREE EDIT</span>
          <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl md:text-6xl">Banarshi Silk Sarees</h1>
          <p className="mt-3 max-w-xl text-[11px] leading-6 text-white/75 sm:text-sm">
            Discover heirloom-worthy silk, intricate zari and the timeless artistry of Varanasi, chosen for your most beautiful moments.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-[5%] py-8 sm:px-[6%] sm:py-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <span className="text-[8px] font-semibold tracking-[0.24em] text-[#986d8f]">CURATED FOR YOU</span>
            <h2 className="mt-1 font-serif text-2xl sm:text-3xl">The Banarshi edit</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product, index) => (
            <article key={product.id} className="group flex flex-col overflow-hidden border border-[#e9e0d9] bg-white shadow-[0_4px_18px_rgba(43,27,38,0.045)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(43,27,38,0.12)]">
              <div className="relative aspect-[4/4.8] overflow-hidden bg-[#eee6e0]">
                <Image
                  src={`https://images.unsplash.com/${product.image}?auto=format&fit=crop&w=900&q=85`}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                  unoptimized
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.045]"
                />
                <span className="absolute left-2.5 top-2.5 bg-[#fffaf4]/95 px-2 py-1.5 text-[7px] font-semibold tracking-[0.12em] text-[#684768] shadow-sm sm:left-3 sm:top-3 sm:px-2.5 sm:text-[8px]">{product.label}</span>
                <span className="absolute bottom-2.5 right-2.5 rounded-full bg-[#211821]/75 px-2.5 py-1 text-[8px] text-white backdrop-blur-sm">{String(index + 1).padStart(2, "0")} / 10</span>
              </div>
              <div className="flex flex-1 flex-col p-3 sm:p-4">
                <span className="text-[7px] font-medium uppercase tracking-[0.15em] text-[#9a778f] sm:text-[8px]">{product.fabric}</span>
                <h3 className="mt-1 min-h-7 font-serif text-[13px] leading-snug text-[#302531] sm:min-h-7 sm:text-[15px]">{product.name}</h3>
                <div className="flex items-center gap-1.5 text-[9px] text-[#ae8950] sm:text-[10px]">
                  <span aria-label={`Rated ${product.rating} out of 5`} className="inline-flex items-center gap-0.5"><FiStar aria-hidden="true" className="fill-current" size={11} /> {product.rating.toFixed(1)}</span>
                  <span className="text-[8px] text-[#777078] sm:text-[9px]">({product.reviews} reviews)</span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <strong className="text-[12px] font-semibold text-[#251c25] sm:text-[13px]">₹{product.price.toLocaleString("en-IN")}</strong>
                  <span className="text-[9px] text-[#777078] line-through">₹{Math.round(product.price * 1.2).toLocaleString("en-IN")}</span>
                </div>
                <div className="mt-auto grid grid-cols-2 gap-1.5 pt-3 sm:gap-2 sm:pt-4">
                  <button type="button" className="min-h-9 rounded-sm bg-[#30172f] px-1.5 text-[8px] font-semibold tracking-wide text-white transition hover:bg-[#593153] sm:min-h-10 sm:px-2 sm:text-[10px]">Buy now</button>
                  <button type="button" className="min-h-9 rounded-sm border border-[#cbb8c8] px-1.5 text-[8px] font-semibold tracking-wide text-[#30172f] transition hover:border-[#30172f] hover:bg-[#f6eef4] sm:min-h-10 sm:px-2 sm:text-[10px]">{cart[product.id] ? `Add again (${cart[product.id]})` : "Add to bag"}</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div aria-live="polite" className={`fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#30172f] px-5 py-3 text-center text-[11px] text-white shadow-xl transition-all ${message ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}>{message}</div>
    </main>
  );
}
