"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { FiArrowLeft, FiCalendar, FiChevronDown, FiLoader, FiMapPin, FiPlus, FiRefreshCw, FiShoppingBag, FiX } from "react-icons/fi";
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

function categoryStyle(category: string) {
  if (category === "saree") return "border-[#e5d3e2] bg-[#f7eff6] text-[#62385f]";
  if (category === "shut") return "border-[#efdfbc] bg-[#fbf5e8] text-[#8a682e]";
  return "border-[#cfe4dc] bg-[#eef7f3] text-[#356b57]";
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
  const [selectedSupplierKey, setSelectedSupplierKey] = useState<string | null>(null);

  const supplierSpend = useMemo(() => {
    const companies = new Map<string, { name: string; spend: number; entries: number }>();
    for (const purchase of purchases) {
      const key = purchase.companyName.trim().toLocaleLowerCase();
      const company = companies.get(key) ?? { name: purchase.companyName.trim(), spend: 0, entries: 0 };
      company.spend += purchase.total_price;
      company.entries += 1;
      companies.set(key, company);
    }
    return [...companies.values()].sort((first, second) => second.spend - first.spend);
  }, [purchases]);

  const selectedSupplier = supplierSpend.find((supplier) => supplier.name.toLocaleLowerCase() === selectedSupplierKey) ?? null;
  const selectedSupplierPurchases = useMemo(() => {
    if (!selectedSupplierKey) return [];
    return purchases
      .filter((purchase) => purchase.companyName.trim().toLocaleLowerCase() === selectedSupplierKey)
      .sort((first, second) => new Date(second.purchaseDate || second.createdAt).getTime() - new Date(first.purchaseDate || first.createdAt).getTime());
  }, [purchases, selectedSupplierKey]);

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

  useEffect(() => {
    if (!notice) return;
    const timeoutId = window.setTimeout(() => setNotice(""), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

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

  if (selectedSupplierKey) {
    return (
      <SupplierPurchasesView
        companyName={selectedSupplier?.name ?? selectedSupplierKey}
        purchases={selectedSupplierPurchases}
        onBack={() => setSelectedSupplierKey(null)}
      />
    );
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
          <div className="border-t border-[#f0ece8] px-6 py-10"><LoadingSpinner label="Loading purchases" /></div>
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
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-[#817982]">
                      <span>{purchase.place}</span>
                      <CategoryBadge category={purchase.category} />
                    </div>
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
                    <td className="px-4 py-4"><CategoryBadge category={purchase.category} /></td>
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

      <section className="mt-5 overflow-hidden rounded-xl border border-[#ece6df] bg-white p-4 shadow-[0_4px_18px_rgba(48,23,47,0.035)] sm:mt-6 sm:rounded-2xl sm:p-5 md:p-6">
        <div className="mb-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">Supplier insights</p>
          <h2 className="mt-1 font-serif text-lg sm:text-xl">Purchase share by company</h2>
          <p className="mt-1 text-[11px] text-[#928a92] sm:text-xs">Each slice shows that company’s share of total purchasing spend.</p>
        </div>
        {isLoading ? (
          <LoadingSpinner label="Loading supplier chart" />
        ) : supplierSpend.length === 0 ? (
          <p className="rounded-xl bg-[#fcfbf9] px-4 py-8 text-center text-xs text-[#928a92]">The supplier pie chart will appear after purchases are recorded.</p>
        ) : (
          <SupplierPieChart suppliers={supplierSpend} onSelect={(name) => setSelectedSupplierKey(name.toLocaleLowerCase())} />
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

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium capitalize ${categoryStyle(category)}`}>
      {category}
    </span>
  );
}

function LoadingSpinner({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className="flex min-h-14 items-center justify-center text-plum">
      <FiLoader size={20} className="animate-spin" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

const pieColors = ["#492447", "#a56c8f", "#c8a56c", "#6b927f", "#82769b", "#d28c71", "#6d8da1", "#bd7890", "#87945f", "#a77d4d"];

function SupplierPieChart({ suppliers, onSelect }: {
  suppliers: { name: string; spend: number; entries: number }[];
  onSelect: (name: string) => void;
}) {
  const totalSpend = suppliers.reduce((total, supplier) => total + supplier.spend, 0);
  let currentAngle = 0;
  const segments = suppliers.map((supplier, index) => {
    const startAngle = currentAngle;
    currentAngle += totalSpend > 0 ? (supplier.spend / totalSpend) * 360 : 0;
    return `${pieColors[index % pieColors.length]} ${startAngle}deg ${currentAngle}deg`;
  });
  const chartBackground = totalSpend > 0
    ? `conic-gradient(${segments.join(", ")})`
    : "conic-gradient(#e9e3dc 0deg 360deg)";

  return (
    <div className="grid items-center gap-6 md:grid-cols-[minmax(220px,0.8fr)_1.2fr] md:gap-10">
      <div className="flex justify-center">
        <div
          role="img"
          aria-label={`Purchase spend by company. Total ${formatPrice(totalSpend)}.`}
          className="relative h-52 w-52 rounded-full sm:h-60 sm:w-60"
          style={{ background: chartBackground }}
        >
          <div className="absolute inset-[24%] flex flex-col items-center justify-center rounded-full border border-[#f0ece8] bg-white text-center shadow-inner">
            <span className="text-[10px] text-[#928a92]">Total spend</span>
            <strong className="mt-1 max-w-full px-2 text-sm text-[#332a35]">{formatPrice(totalSpend)}</strong>
          </div>
        </div>
      </div>
      <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
        {suppliers.map((supplier, index) => {
          const share = totalSpend > 0 ? (supplier.spend / totalSpend) * 100 : 0;
          return (
            <button
              key={supplier.name}
              type="button"
              onClick={() => onSelect(supplier.name)}
              className="flex w-full items-center gap-3 rounded-xl border border-[#f0ece8] bg-[#fffdfa] px-3 py-2.5 text-left transition hover:border-[#d8c6d6] hover:bg-[#fbf6fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum/30"
              aria-label={`View purchases from ${supplier.name}`}
            >
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: pieColors[index % pieColors.length] }} />
              <span className="min-w-0 flex-1 truncate text-xs font-medium text-[#514852]">{supplier.name}</span>
              <span className="shrink-0 text-right">
                <span className="block text-xs font-semibold text-[#332a35]">{formatPrice(supplier.spend)}</span>
                <span className="text-[10px] text-[#928a92]">{share.toFixed(1)}% · {supplier.entries} {supplier.entries === 1 ? "purchase" : "purchases"}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SupplierPurchasesView({ companyName, purchases, onBack }: {
  companyName: string;
  purchases: Purchase[];
  onBack: () => void;
}) {
  const totalSpend = purchases.reduce((total, purchase) => total + purchase.total_price, 0);
  const latestPurchaseDate = purchases[0] ? purchases[0].purchaseDate || purchases[0].createdAt : null;

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-2 rounded-lg border border-[#e6dfd8] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#514852] shadow-sm transition hover:border-[#d8c6d6] hover:bg-[#fbf6fa] hover:text-plum sm:mb-6"
      >
        <FiArrowLeft size={15} /> Back to purchasing
      </button>

      <div className="mb-5 sm:mb-6">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold sm:text-xs">Supplier purchase history</p>
        <h1 className="break-words font-serif text-[26px] leading-tight text-[#29232b] sm:text-3xl lg:text-4xl">{companyName}</h1>
        <p className="mt-1.5 text-[13px] text-[#817982] sm:text-sm">Purchases from this supplier, newest first.</p>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:mb-6 sm:grid-cols-3 sm:gap-4">
        <article className="rounded-xl border border-[#ece6df] bg-white p-4 sm:rounded-2xl sm:p-5">
          <p className="text-[10px] font-medium text-[#817982] sm:text-xs">Total purchased</p>
          <p className="mt-2 text-base font-semibold text-[#332a35] sm:text-xl">{formatPrice(totalSpend)}</p>
        </article>
        <article className="rounded-xl border border-[#ece6df] bg-white p-4 sm:rounded-2xl sm:p-5">
          <p className="text-[10px] font-medium text-[#817982] sm:text-xs">Purchase entries</p>
          <p className="mt-2 text-base font-semibold text-[#332a35] sm:text-xl">{purchases.length}</p>
        </article>
        <article className="col-span-2 rounded-xl border border-[#ece6df] bg-white p-4 sm:col-span-1 sm:rounded-2xl sm:p-5">
          <p className="text-[10px] font-medium text-[#817982] sm:text-xs">Latest purchase</p>
          <p className="mt-2 text-base font-semibold text-[#332a35] sm:text-xl">{latestPurchaseDate ? formatDate(latestPurchaseDate) : "—"}</p>
        </article>
      </div>

      <section className="overflow-hidden rounded-xl border border-[#ece6df] bg-white shadow-[0_4px_18px_rgba(48,23,47,0.035)] sm:rounded-2xl">
        <div className="px-4 py-4 sm:px-5 sm:py-4 md:px-6">
          <h2 className="font-serif text-lg sm:text-xl">Purchases by date</h2>
          <p className="mt-1 text-[11px] text-[#928a92] sm:text-xs">{purchases.length} {purchases.length === 1 ? "purchase" : "purchases"} from {companyName}</p>
        </div>
        {purchases.length === 0 ? (
          <div className="border-t border-[#f0ece8] px-5 py-12 text-center text-sm text-[#928a92]">No purchases found for this supplier.</div>
        ) : (
          <div className="grid gap-3 border-t border-[#f0ece8] bg-[#fcfbf9] p-3 sm:grid-cols-2 sm:p-4 xl:grid-cols-3">
            {purchases.map((purchase) => (
              <article key={purchase._id} className="rounded-xl border border-[#ece6df] bg-white p-4 shadow-[0_3px_12px_rgba(48,23,47,0.03)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(48,23,47,0.07)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-[11px] font-medium text-[#817982]"><FiCalendar size={13} className="shrink-0 text-[#a07848]" />{formatDate(purchase.purchaseDate || purchase.createdAt)}</p>
                    <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[#817982]"><FiMapPin size={13} className="shrink-0" />{purchase.place}</p>
                  </div>
                  <p className="shrink-0 text-right text-sm font-semibold text-[#332a35]">{formatPrice(purchase.total_price)}</p>
                </div>
                <div className="mt-3 border-t border-[#f2eeea] pt-3">
                  <CategoryBadge category={purchase.category} />
                </div>
                {purchase.description && <p className="mt-3 border-t border-[#f2eeea] pt-3 text-xs leading-5 text-[#625a63]">{purchase.description}</p>}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
