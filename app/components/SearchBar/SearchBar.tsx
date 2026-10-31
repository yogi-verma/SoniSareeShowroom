"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FiArrowRight, FiCheck, FiChevronDown, FiLoader, FiSearch, FiX } from "react-icons/fi";

type Product = {
  _id: string;
  productType: string;
  category: string;
  name: string;
  price: number;
  photo?: { url?: string };
};

const productTypes = [
  { value: "all", label: "All pieces" },
  { value: "saree", label: "Sarees" },
  { value: "shut", label: "Shuts" },
  { value: "rajputi poshak", label: "Rajputi Poshak" },
];

const priceOptions = [
  { label: "Any price", value: null },
  { label: "Under ₹500", value: 499.99 },
  { label: "Under ₹1,000", value: 999.99 },
  { label: "Under ₹1,500", value: 1499.99 },
];

const pageSize = 12;

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [productType, setProductType] = useState("all");
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const hasCriteria = query.trim().length >= 1 || productType !== "all" || maxPrice !== null;
  const priceInQuery = query.match(/\b(?:under|below|less than|up to|upto)\s*₹?\s*([\d,]+(?:\.\d+)?)/i);
  const queryMaxPrice = priceInQuery ? Math.max(0, Number(priceInQuery[1].replaceAll(",", "")) - 0.01) : null;
  const effectiveMaxPrice = queryMaxPrice ?? maxPrice;

  useEffect(() => {
    if (!isOpen) return;

    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 0);
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setIsTypeMenuOpen(false);
      }
    }
    function closeTypeMenu(event: MouseEvent) {
      if (event.target instanceof Node && !panelRef.current?.contains(event.target)) setIsTypeMenuOpen(false);
    }
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeTypeMenu);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeTypeMenu);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !hasCriteria) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      setError("");
      const params = new URLSearchParams({ limit: String(pageSize), skip: String(offset) });
      const searchText = query.trim().replace(/\b(?:under|below|less than|up to|upto)\s*₹?\s*[\d,]+(?:\.\d+)?/i, "").trim();
      if (searchText) params.set("search", searchText);
      if (productType !== "all") params.set("productType", productType);
      if (effectiveMaxPrice !== null) params.set("maxPrice", String(effectiveMaxPrice));

      try {
        const response = await fetch(`/api/catalog/products?${params.toString()}`, { cache: "no-store", signal: controller.signal });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || "Could not search products.");
        const page = Array.isArray(result.products) ? result.products as Product[] : [];
        setProducts((current) => offset === 0 ? page : [...current, ...page]);
        setHasMore(page.length === pageSize);
      } catch (searchError) {
        if (!controller.signal.aborted) setError(searchError instanceof Error ? searchError.message : "Could not search products.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, offset === 0 ? 250 : 0);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [effectiveMaxPrice, hasCriteria, isOpen, offset, productType, query]);

  function resetResults() {
    setProducts([]);
    setHasMore(false);
    setOffset(0);
    setError("");
  }

  function closeSearch() {
    setIsOpen(false);
    setIsTypeMenuOpen(false);
    setIsLoading(false);
  }

  return (
    <>
      <button
        type="button"
        aria-label="Search products"
        title="Search products"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        className="grid h-10 w-10 place-items-center rounded-full text-white/90 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8c5dc]"
      >
        <FiSearch aria-hidden="true" size={18} strokeWidth={1.6} />
      </button>

      {isOpen && <>
        <button type="button" aria-label="Close product search" onClick={closeSearch} className="fixed inset-0 z-[59] cursor-default bg-[#211821]/35 backdrop-blur-[2px]" />
        <section ref={panelRef} role="dialog" aria-modal="true" aria-label="Search the collection" className="fixed inset-x-3 top-[72px] z-[60] mx-auto max-h-[min(78vh,680px)] max-w-2xl overflow-y-auto rounded-2xl border border-[#eadfd8] bg-[#fffdfa] text-[#302531] shadow-[0_24px_80px_rgba(22,13,22,0.3)] sm:inset-x-6 sm:top-24">
          <div className="sticky top-0 z-10 border-b border-[#eee7e1] bg-[#fffdfa]/95 p-4 backdrop-blur sm:p-5">
            <div className="flex items-center gap-3">
              <FiSearch size={19} aria-hidden="true" className="shrink-0 text-[#986d8f]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => { setQuery(event.target.value); resetResults(); }}
                onKeyDown={(event) => { if (event.key === "Enter") event.preventDefault(); }}
                placeholder="Search sarees, shuts, poshak…"
                aria-label="Search product names"
                className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-[#a79ba4] sm:text-base"
              />
              {query && <button type="button" onClick={() => { setQuery(""); resetResults(); inputRef.current?.focus(); }} aria-label="Clear search" className="grid h-8 w-8 place-items-center rounded-full text-[#817681] hover:bg-[#f6eef4]"><FiX size={16} /></button>}
              <button type="button" onClick={closeSearch} aria-label="Close search" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#eee7e1] text-[#684768] transition hover:bg-[#f6eef4]"><FiX size={17} /></button>
            </div>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative shrink-0">
                <button type="button" aria-haspopup="listbox" aria-expanded={isTypeMenuOpen} onClick={() => setIsTypeMenuOpen((open) => !open)} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#dfd3dd] bg-white px-3 text-[10px] font-semibold text-[#514852] transition hover:border-[#b99bb5]">
                  {productTypes.find((type) => type.value === productType)?.label}<FiChevronDown size={13} className={`transition-transform ${isTypeMenuOpen ? "rotate-180" : ""}`} />
                </button>
                {isTypeMenuOpen && <div role="listbox" aria-label="Filter by product type" className="absolute left-0 top-full z-20 mt-1 min-w-44 rounded-xl border border-[#eadfd8] bg-white p-1.5 shadow-xl">{productTypes.map((type) => <button key={type.value} type="button" role="option" aria-selected={productType === type.value} onClick={() => { setProductType(type.value); resetResults(); setIsTypeMenuOpen(false); }} className="flex min-h-9 w-full items-center justify-between gap-3 rounded-lg px-3 text-left text-[11px] text-[#514852] transition hover:bg-[#f6eef4]"><span>{type.label}</span>{productType === type.value && <FiCheck size={14} className="text-[#684768]" />}</button>)}</div>}
              </div>
              <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                <span className="mr-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#958a93]">Price</span>
                {priceOptions.map((option) => <button key={option.label} type="button" aria-pressed={effectiveMaxPrice === option.value} onClick={() => { setMaxPrice(option.value); resetResults(); }} className={`min-h-8 rounded-full border px-2.5 text-[9px] font-medium transition ${effectiveMaxPrice === option.value ? "border-[#684768] bg-[#f6eef4] text-[#684768]" : "border-[#eee7e1] bg-white text-[#776c77] hover:border-[#cbb8c8] hover:text-[#684768]"}`}>{option.label}</button>)}
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            {!hasCriteria ? <div className="py-7 text-center"><p className="font-serif text-lg">Find your next favourite</p><p className="mt-1 text-[11px] text-[#817681]">Search by product name, choose a collection, or filter by price.</p><div className="mt-4 flex flex-wrap justify-center gap-2">{["Banarasi", "Silk", "Bandhani"].map((suggestion) => <button key={suggestion} type="button" onClick={() => { setQuery(suggestion); resetResults(); }} className="rounded-full border border-[#eee7e1] bg-white px-3 py-1.5 text-[10px] text-[#684768] transition hover:bg-[#f6eef4]">{suggestion}</button>)}</div></div>
              : error ? <p role="alert" className="rounded-lg bg-[#fff6f5] px-3 py-3 text-xs text-[#9b3935]">{error}</p>
                : isLoading && offset === 0 && !products.length ? <div className="flex items-center justify-center gap-2 py-10 text-xs text-[#817681]"><FiLoader className="animate-spin" /> Searching the collection…</div>
                  : products.length ? <>
                    <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#958a93]">Matching pieces</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {products.map((product) => <Link key={product._id} href={`/products/${encodeURIComponent(product._id)}`} onClick={closeSearch} className="group flex min-w-0 items-center gap-3 rounded-xl border border-[#eee7e1] bg-white p-2 transition hover:border-[#cbb8c8] hover:bg-[#fffdfa] hover:shadow-sm focus-visible:outline-2 focus-visible:outline-[#986d8f]">
                        <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-[#f0e9e4]">{product.photo?.url ? <Image src={product.photo.url} alt="" fill unoptimized sizes="56px" className="object-cover transition duration-300 group-hover:scale-105" /> : <span className="grid h-full place-items-center text-[8px] text-[#9a778f]">No image</span>}</div>
                        <span className="min-w-0 flex-1"><span className="block truncate text-[11px] font-semibold text-[#302531] group-hover:text-[#684768]">{product.name}</span><span className="mt-1 block truncate text-[9px] capitalize text-[#817681]">{product.productType} · {product.category}</span><span className="mt-1 block text-[10px] font-semibold text-[#684768]">{formatPrice(product.price)}</span></span>
                        <FiArrowRight size={14} className="mr-1 shrink-0 text-[#a99ba7] transition group-hover:translate-x-0.5 group-hover:text-[#684768]" />
                      </Link>)}
                    </div>
                    {hasMore && <button type="button" disabled={isLoading} onClick={() => setOffset((current) => current + pageSize)} className="mx-auto mt-4 flex min-h-9 items-center gap-2 rounded-lg border border-[#dfd3dd] px-4 text-[10px] font-semibold text-[#684768] transition hover:bg-[#f6eef4] disabled:opacity-60">{isLoading ? <FiLoader size={13} className="animate-spin" /> : null}Show more results</button>}
                  </> : isLoading ? <div className="flex items-center justify-center gap-2 py-10 text-xs text-[#817681]"><FiLoader className="animate-spin" /> Searching the collection…</div> : <div className="py-9 text-center"><p className="font-serif text-lg">No pieces found</p><p className="mt-1 text-[11px] text-[#817681]">Try another name, collection, or price range.</p><button type="button" onClick={() => { setQuery(""); setProductType("all"); setMaxPrice(null); resetResults(); }} className="mt-3 text-[10px] font-semibold text-[#684768] underline underline-offset-4">Clear filters</button></div>}
          </div>
          <div className="border-t border-[#eee7e1] px-4 py-2.5 text-center text-[9px] text-[#a0949d]">Search by name · filter by collection and price</div>
        </section>
      </>}
    </>
  );
}
