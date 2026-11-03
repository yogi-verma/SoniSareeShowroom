"use client";

import { useCallback, useEffect, useState } from "react";
import { FiRefreshCw, FiShoppingBag } from "react-icons/fi";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import ProductCard from "../components/ProductCard";
import { useStockRefresh } from "../lib/useStockRefresh";

type ProductType = "shut" | "rajputi poshak";
type Product = {
  _id: string;
  productType: ProductType;
  category: string;
  name: string;
  price: number;
  stock: number;
  photo?: { url?: string };
};

export default function CategoryProducts({ categoryName, collectionName, productType }: { categoryName: string; collectionName: string; productType: ProductType }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshProducts = useCallback(async () => {
    const params = new URLSearchParams({ productType });
    const response = await fetch(`/api/catalog/products?${params}`, { cache: "no-store" });
    const result = await response.json().catch(() => ({}));
    if (response.ok) setProducts(result.products ?? []);
  }, [productType]);

  useStockRefresh(refreshProducts);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ productType });
    fetch(`/api/catalog/products?${params}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || `Could not load ${collectionName}.`);
        setProducts(result.products ?? []);
      })
      .catch((loadError: unknown) => {
        if (!controller.signal.aborted) setError(loadError instanceof Error ? loadError.message : `Could not load ${collectionName}.`);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [collectionName, productType]);

  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#302531]">
      <Header />
      <section className="relative overflow-hidden bg-gradient-to-br from-[#40233e] via-[#30172f] to-[#211821] pb-14 pt-28 text-white sm:pb-16 sm:pt-32">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <span className="text-[9px] font-semibold tracking-[0.26em] text-[#e4bfd8]">THE SONI SHOWROOM COLLECTION</span>
          <h1 className="mt-3 font-serif text-4xl sm:text-5xl">{categoryName}</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">Explore our {collectionName} pieces, selected for the moments you want to remember.</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 py-9 sm:px-8 sm:py-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <span className="text-[9px] font-semibold tracking-[0.22em] text-[#986d8f]">AVAILABLE DESIGNS</span>
            <h2 className="mt-1 font-serif text-2xl">{collectionName}</h2>
          </div>
          {!isLoading && !error && <span className="text-xs text-[#817681]">{products.length} {products.length === 1 ? "design" : "designs"}</span>}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => <div key={index} className="animate-pulse overflow-hidden border border-[#e9e0d9] bg-white"><div className="aspect-[4/4.8] bg-[#eee6e0]" /><div className="space-y-2 p-4"><div className="h-3 w-3/4 rounded bg-[#eee6e0]" /><div className="h-3 w-1/2 rounded bg-[#f3efeb]" /></div></div>)}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-[#efd5d3] bg-white px-5 py-12 text-center">
            <p role="alert" className="text-sm text-[#a13d39]">{error}</p>
            <button type="button" onClick={() => window.location.reload()} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#30172f] px-4 py-2.5 text-xs font-semibold text-white"><FiRefreshCw size={14} /> Try again</button>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#d9cbd4] bg-white px-5 py-14 text-center">
            <FiShoppingBag size={24} className="mx-auto text-[#9a778f]" />
            <h3 className="mt-3 font-serif text-xl">New designs are on their way</h3>
            <p className="mt-2 text-sm text-[#777078]">There are no {collectionName} products in the catalog yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {products.map((product) => <ProductCard key={product._id} product={product} />)}
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
