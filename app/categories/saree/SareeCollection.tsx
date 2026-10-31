"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { FiLoader, FiRefreshCw, FiShoppingBag } from "react-icons/fi";
import { useAuth } from "../../components/Auth/AuthProvider";
import { addCartItem } from "../../lib/cartApi";
import { openProductCheckout } from "../../lib/paymentApi";

type SareeProduct = {
  _id: string;
  productType: "saree";
  category: string;
  name: string;
  price: number;
  stock: number;
  photo: { url: string };
};

type Props = {
  title: string;
  editTitle: string;
  description: string;
  category?: string;
  heroImage: StaticImageData;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function SareeCollection({ title, editTitle, description, category, heroImage }: Props) {
  const { user, openSignIn } = useAuth();
  const [products, setProducts] = useState<SareeProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [checkoutProductId, setCheckoutProductId] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({ productType: "saree" });
      if (category) query.set("category", category);
      const response = await fetch(`/api/catalog/products?${query.toString()}`, { cache: "no-store" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Could not load this collection.");
      setProducts(result.products ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load this collection.");
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams({ productType: "saree" });
    if (category) query.set("category", category);

    fetch(`/api/catalog/products?${query.toString()}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || "Could not load this collection.");
        setProducts(result.products ?? []);
      })
      .catch((loadError: unknown) => {
        if (controller.signal.aborted) return;
        setError(loadError instanceof Error ? loadError.message : "Could not load this collection.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [category]);

  useEffect(() => {
    if (!message) return;
    const timeoutId = window.setTimeout(() => setMessage(""), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [message]);

  const requestShoppingAction = async (product: SareeProduct) => {
    if (!user) {
      openSignIn();
      return;
    }
    setCheckoutProductId(product._id);
    setMessage("");
    try {
      await openProductCheckout(product._id, { name: user.name, email: user.email }, {
        onVerified: (status) => setMessage(status === "paid" ? `Payment successful · ${product.name}` : "Payment authorized and awaiting confirmation."),
        onFailure: setMessage,
        onDismiss: () => setMessage("Checkout was closed. No payment was confirmed."),
      });
    } catch (checkoutError) {
      setMessage(checkoutError instanceof Error ? checkoutError.message : "Could not start checkout.");
    } finally {
      setCheckoutProductId(null);
    }
  };

  const addProductToBag = async (product: SareeProduct) => {
    if (!user) {
      openSignIn();
      return;
    }
    setAddingProductId(product._id);
    try {
      const result = await addCartItem(product._id);
      setMessage(`${product.name} added to your bag · ${result.cart.totalItems} item${result.cart.totalItems === 1 ? "" : "s"} total`);
    } catch (addError) {
      setMessage(addError instanceof Error ? addError.message : "Could not add this item to your bag.");
    } finally {
      setAddingProductId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#2d242d]">
      <section className="relative isolate overflow-hidden bg-[#281b26] text-white">
        <Image src={heroImage} alt={`${title} collection`} fill priority sizes="100vw" className="-z-20 object-cover object-center opacity-45" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#211821]/95 via-[#211821]/75 to-[#211821]/35" />
        <div className="mx-auto max-w-6xl px-[6%] pb-12 pt-32 sm:pb-16 sm:pt-25">
          <span className="text-[9px] font-semibold tracking-[0.28em] text-[#e3bfd8]">THE SONI SAREE EDIT</span>
          <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl md:text-6xl">{title}</h1>
          <p className="mt-3 max-w-xl text-[11px] leading-6 text-white/75 sm:text-sm">{description}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-[5%] py-8 sm:px-[6%] sm:py-7">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <span className="text-[8px] font-semibold tracking-[0.24em] text-[#986d8f]">CURATED FOR YOU</span>
            <h2 className="mt-1 font-serif text-2xl sm:text-3xl">The {editTitle} edit</h2>
            {!isLoading && !error && <p className="mt-1 text-xs text-[#777078]">{products.length} {products.length === 1 ? "design" : "designs"} available</p>}
          </div>
          <button type="button" onClick={() => void loadProducts()} disabled={isLoading} aria-label="Refresh saree collection" className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[#d8cbd5] bg-white px-3 text-[10px] font-medium text-[#513c50] transition hover:bg-[#f6eef4] disabled:opacity-60">
            {isLoading ? <FiLoader size={14} className="animate-spin" /> : <FiRefreshCw size={14} />} Refresh
          </button>
        </div>

        {error ? (
          <div className="rounded-xl border border-[#efd5d3] bg-white px-5 py-12 text-center">
            <p role="alert" className="text-sm text-[#a13d39]">{error}</p>
            <button type="button" onClick={() => void loadProducts()} className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#30172f] px-4 py-2.5 text-xs font-semibold text-white"><FiRefreshCw size={14} /> Try again</button>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => <div key={index} className="overflow-hidden border border-[#e9e0d9] bg-white"><div className="aspect-[4/4.8] animate-pulse bg-[#eee6e0]" /><div className="space-y-2 p-3"><div className="h-3 w-3/4 animate-pulse rounded bg-[#eee6e0]" /><div className="h-3 w-1/2 animate-pulse rounded bg-[#f3efeb]" /></div></div>)}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-xl border border-[#e9e0d9] bg-white px-5 py-14 text-center">
            <FiShoppingBag size={25} className="mx-auto text-[#9a778f]" aria-hidden="true" />
            <h3 className="mt-3 font-serif text-xl">This edit is being refreshed</h3>
            <p className="mt-2 text-sm text-[#777078]">There are no {editTitle.toLowerCase()} sarees in stock right now. Please check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => (
              <article key={product._id} className="group flex flex-col overflow-hidden border border-[#e9e0d9] bg-white shadow-[0_4px_18px_rgba(43,27,38,0.045)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(43,27,38,0.12)]">
                <div className="relative aspect-[4/4.8] overflow-hidden bg-[#eee6e0]">
              <Link href={`/products/${encodeURIComponent(product._id)}`} aria-label={`View ${product.name}`} className="absolute inset-0 z-[1]">
                <Image src={product.photo.url} alt={product.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw" unoptimized className="object-cover transition-transform duration-700 group-hover:scale-[1.045]" />
              </Link>
                  <span className="absolute left-2.5 top-2.5 rounded-full bg-[#fffaf4]/95 px-2 py-1.5 text-[7px] font-semibold tracking-[0.12em] text-[#684768] shadow-sm sm:left-3 sm:top-3 sm:px-2.5 sm:text-[8px]">{product.category}</span>
                  <span className="absolute bottom-2.5 right-2.5 rounded-full bg-[#211821]/75 px-2.5 py-1 text-[8px] text-white backdrop-blur-sm">{String(index + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")}</span>
                </div>
                <div className="flex flex-1 flex-col p-3 sm:p-4">
                  <h3 className="min-h-7 font-serif text-[13px] leading-snug text-[#302531] sm:text-[15px]"><Link href={`/products/${encodeURIComponent(product._id)}`} className="rounded-sm hover:text-[#684768] focus-visible:outline-2 focus-visible:outline-[#986d8f]">{product.name}</Link></h3>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <strong className="text-[12px] font-semibold text-[#251c25] sm:text-[14px]">{formatPrice(product.price)}</strong>
                    <span className={`text-[8px] font-medium sm:text-[9px] ${product.stock > 0 ? "text-[#54745f]" : "text-[#a13d39]"}`}>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</span>
                  </div>
                  <div className="mt-auto grid grid-cols-2 gap-1.5 pt-3 sm:gap-2 sm:pt-4">
                    <button type="button" disabled={!product.stock || checkoutProductId === product._id} onClick={() => void requestShoppingAction(product)} className="min-h-9 rounded-sm bg-[#30172f] px-1.5 text-[8px] font-semibold tracking-wide text-white transition hover:bg-[#593153] disabled:cursor-not-allowed disabled:bg-[#a99ca8] sm:min-h-10 sm:px-2 sm:text-[10px]">{checkoutProductId === product._id ? <span className="inline-flex items-center justify-center gap-1"><FiLoader size={12} className="animate-spin" aria-hidden="true" /> Redirecting…</span> : "Buy now"}</button>
                    <button type="button" disabled={!product.stock || addingProductId === product._id} onClick={() => void addProductToBag(product)} className="min-h-9 rounded-sm border border-[#cbb8c8] px-1.5 text-[8px] font-semibold tracking-wide text-[#30172f] transition hover:border-[#30172f] hover:bg-[#f6eef4] disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-10 sm:px-2 sm:text-[10px]">{addingProductId === product._id ? "Adding…" : "Add to bag"}</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div aria-live="polite" className={`fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#30172f] px-5 py-3 text-center text-[11px] text-white shadow-xl transition-all ${message ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}>{message}</div>
    </main>
  );
}
