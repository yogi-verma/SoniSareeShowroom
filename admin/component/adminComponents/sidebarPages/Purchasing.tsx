"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { FiCalendar, FiChevronDown, FiPlus, FiRefreshCw, FiShoppingBag, FiX } from "react-icons/fi";
import { createPurchase, getPurchases } from "../../../utils/adminApi";
import type { Purchase, PurchaseInput } from "../../../utils/adminApi";

const places = ["Charkhi Dardi", "Surat", "Jaipur", "Bhiwani", "Rohtak"];
const categories = ["shut", "saree", "rajputi poshak"];

function createEmptyForm() {
  const today = new Date();
  return {
    companyName: "",
    place: "",
    description: "",
    category: "",
    total_price: "",
    purchaseDate: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`,
  };
}

const fieldClassName = "w-full rounded-xl border border-[#e6dfe5] bg-white px-3.5 py-3 text-sm text-[#332a35] outline-none transition placeholder:text-[#b0a8b0] hover:border-[#d1c2cf] focus:border-[#a87c9e] focus:ring-4 focus:ring-[#a87c9e]/10";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(price);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value.length === 10 ? `${value}T00:00:00.000Z` : value));
}

export default function Purchasing() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(createEmptyForm);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadPurchases() {
    setIsLoading(true);
    setLoadError("");

    try {
      const result = await getPurchases();
      setPurchases(result.purchases);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load purchases.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadPurchases();
  }, []);

  function closeModal() {
    if (isSaving) return;
    setIsModalOpen(false);
    setForm(createEmptyForm());
    setFormError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setNotice("");
    setIsSaving(true);

    const purchase: PurchaseInput = {
      companyName: form.companyName.trim(),
      place: form.place,
      description: form.description.trim(),
      category: form.category,
      total_price: Number(form.total_price),
      purchaseDate: form.purchaseDate,
    };

    try {
      const result = await createPurchase(purchase);
      setPurchases((current) => [result.purchase, ...current]);
      setIsModalOpen(false);
      setForm(createEmptyForm());
      setNotice("Purchase recorded successfully.");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not record the purchase.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:mb-6 sm:flex-row sm:items-end sm:gap-4">
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold sm:mb-2 sm:text-xs sm:tracking-[0.22em]">Stock management</p>
          <h1 className="font-serif text-[28px] leading-tight sm:text-3xl lg:text-4xl">Purchasing</h1>
          <p className="mt-1.5 max-w-xl text-[13px] leading-5 text-[#817982] sm:mt-2 sm:text-sm">Keep track of stock purchased from your wholesale suppliers.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setNotice("");
            setFormError("");
            setIsModalOpen(true);
          }}
          className="inline-flex w-fit items-center gap-2 rounded-lg bg-plum px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#432140] sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm"
        >
          <FiPlus size={17} /> Enter Purchasing
        </button>
      </div>

      {notice && (
        <p role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </p>
      )}

      <section className="overflow-hidden rounded-xl border border-[#ece6df] bg-white shadow-[0_4px_18px_rgba(48,23,47,0.035)] sm:rounded-2xl">
        <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4 md:px-6">
          <div>
            <h2 className="font-serif text-lg sm:text-xl">Purchase history</h2>
            <p className="mt-1 text-[11px] text-[#928a92] sm:text-xs">Wholesale stock entries, newest first</p>
          </div>
          <button
            type="button"
            onClick={() => void loadPurchases()}
            disabled={isLoading}
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#e6dfd8] px-3 py-2 text-[11px] font-medium text-[#514952] transition hover:bg-[#faf8f5] disabled:opacity-50 sm:text-xs"
          >
            <FiRefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {loadError ? (
          <div className="border-t border-[#f0ece8] px-6 py-12 text-center">
            <p role="alert" className="text-sm text-red-700">{loadError}</p>
            <button type="button" onClick={() => void loadPurchases()} className="mt-3 text-xs font-semibold text-plum hover:underline">Try again</button>
          </div>
        ) : isLoading ? (
          <div className="border-t border-[#f0ece8] px-6 py-12 text-center text-sm text-[#928a92]">Loading purchases…</div>
        ) : purchases.length === 0 ? (
          <div className="border-t border-[#f0ece8] px-6 py-14 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#f6f0f5] text-plum"><FiShoppingBag size={20} /></span>
            <h3 className="mt-4 font-serif text-lg">No purchases recorded yet</h3>
            <p className="mt-1 text-sm text-[#928a92]">Add your first wholesale stock purchase to get started.</p>
          </div>
        ) : (
          <>
          <div className="divide-y divide-[#f2eeea] border-t border-[#f0ece8] sm:hidden">
            {purchases.map((purchase) => (
              <article key={purchase._id} className="px-4 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-[13px] font-semibold text-plum">{purchase.companyName}</h3>
                    <p className="mt-1 text-[11px] text-[#817982]">{purchase.place} <span aria-hidden="true">·</span> <span className="capitalize">{purchase.category}</span></p>
                  </div>
                  <p className="shrink-0 text-right text-[13px] font-semibold text-[#332a35]">{formatPrice(purchase.total_price)}</p>
                </div>
                {purchase.description && <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-[#777078]">{purchase.description}</p>}
                <p className="mt-2 flex items-center gap-1.5 text-[10px] text-[#928a92]"><FiCalendar size={12} aria-hidden="true" />{formatDate(purchase.purchaseDate || purchase.createdAt)}</p>
              </article>
            ))}
          </div>
          <div className="hidden overflow-x-auto border-t border-[#f0ece8] sm:block">
            <table className="w-full min-w-[780px] text-left text-xs">
              <thead className="bg-[#fcfbf9] text-[10px] uppercase tracking-[0.12em] text-[#968d96]">
                <tr>
                  <th className="px-6 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Place</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 text-right font-medium">Total price</th>
                  <th className="px-6 py-3 text-right font-medium">Purchase date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2eeea]">
                {purchases.map((purchase) => (
                  <tr key={purchase._id} className="text-[#554e57]">
                    <td className="px-6 py-4 font-medium text-plum">{purchase.companyName}</td>
                    <td className="px-4 py-4">{purchase.place}</td>
                    <td className="px-4 py-4 capitalize">{purchase.category}</td>
                    <td className="max-w-[280px] truncate px-4 py-4" title={purchase.description || undefined}>{purchase.description || "—"}</td>
                    <td className="px-4 py-4 text-right font-semibold text-[#332a35]">{formatPrice(purchase.total_price)}</td>
                    <td className="px-6 py-4 text-right text-[#817982]">{formatDate(purchase.purchaseDate || purchase.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </section>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#160d18]/60 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="purchase-modal-title" className="relative my-auto max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-xl border border-[#eadfe8] bg-[#fffdfa] p-5 shadow-2xl shadow-black/25 sm:max-h-[calc(100dvh-3rem)] sm:rounded-2xl sm:p-8">
            <button type="button" onClick={closeModal} disabled={isSaving} aria-label="Close purchasing form" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-[#7c737d] transition hover:bg-[#f3eef2] hover:text-plum disabled:opacity-50">
              <FiX size={18} />
            </button>

            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a07848]">Wholesale stock</p>
            <h2 id="purchase-modal-title" className="mt-2 font-serif text-2xl text-[#2b202c]">Enter a purchase</h2>
            <p className="mt-1 text-sm text-[#817982]">Add the supplier and stock purchase details below.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="purchase-company" className="mb-1.5 block text-xs font-semibold text-[#514852]">Company name <span className="text-red-600">*</span></label>
                <input id="purchase-company" name="companyName" required maxLength={120} value={form.companyName} onChange={(event) => setForm({ ...form, companyName: event.target.value })} placeholder="Wholesale company" className={fieldClassName} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="purchase-place" className="mb-1.5 block text-xs font-semibold text-[#514852]">Place <span className="text-red-600">*</span></label>
                  <div className="relative">
                    <select id="purchase-place" name="place" required value={form.place} onChange={(event) => setForm({ ...form, place: event.target.value })} className={`${fieldClassName} appearance-none pr-10`}>
                      <option value="" disabled>Select a place</option>
                      {places.map((place) => <option key={place} value={place}>{place}</option>)}
                    </select>
                    <FiChevronDown aria-hidden="true" size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#817982]" />
                  </div>
                </div>
                <div>
                  <label htmlFor="purchase-category" className="mb-1.5 block text-xs font-semibold text-[#514852]">Category <span className="text-red-600">*</span></label>
                  <div className="relative">
                    <select id="purchase-category" name="category" required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className={`${fieldClassName} appearance-none pr-10`}>
                      <option value="" disabled>Select a category</option>
                      {categories.map((category) => <option key={category} value={category}>{category.replace(/\b\w/g, (letter) => letter.toUpperCase())}</option>)}
                    </select>
                    <FiChevronDown aria-hidden="true" size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#817982]" />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="purchase-date" className="mb-1.5 block text-xs font-semibold text-[#514852]">Purchase date <span className="text-red-600">*</span></label>
                <div className="relative">
                  <input id="purchase-date" name="purchaseDate" type="date" required value={form.purchaseDate} onChange={(event) => setForm({ ...form, purchaseDate: event.target.value })} className={`${fieldClassName} pr-10`} />
                  <FiCalendar aria-hidden="true" size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#817982]" />
                </div>
                <p className="mt-1.5 text-[11px] text-[#928a92]">Choose the date the stock was purchased.</p>
              </div>

              <div>
                <label htmlFor="purchase-description" className="mb-1.5 block text-xs font-semibold text-[#514852]">Description</label>
                <textarea id="purchase-description" name="description" rows={3} maxLength={1000} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Add any useful notes about this purchase" className={`${fieldClassName} resize-y`} />
              </div>

              <div>
                <label htmlFor="purchase-price" className="mb-1.5 block text-xs font-semibold text-[#514852]">Total price (₹) <span className="text-red-600">*</span></label>
                <input id="purchase-price" name="total_price" type="number" required min="0" step="0.01" value={form.total_price} onChange={(event) => setForm({ ...form, total_price: event.target.value })} placeholder="0.00" className={fieldClassName} />
              </div>

              {formError && <p role="alert" className="rounded-lg border border-[#f0d8d6] bg-[#fff6f5] px-3.5 py-3 text-xs text-[#a13d39]">{formError}</p>}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={closeModal} disabled={isSaving} className="rounded-lg border border-[#e6dfe5] px-4 py-3 text-sm font-medium text-[#625a63] transition hover:bg-[#faf8f5] disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-plum px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#432140] disabled:cursor-wait disabled:opacity-65">
                  {isSaving && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
                  {isSaving ? "Saving purchase…" : "Save purchase"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
