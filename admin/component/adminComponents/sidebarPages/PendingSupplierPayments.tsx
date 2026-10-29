"use client";

import { useMemo } from "react";
import { FiAlertCircle, FiCheckCircle, FiLoader } from "react-icons/fi";
import type { Purchase } from "../../../utils/adminApi";

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value.length === 10 ? `${value}T00:00:00.000Z` : value));
}

function getOutstandingAmount(purchase: Purchase) {
  const paid = purchase.paidAmount ?? purchase.payments?.reduce((total, payment) => total + payment.amount, 0) ?? 0;
  return Math.max(purchase.total_price - paid, 0);
}

type SupplierGroup = {
  name: string;
  amount: number;
  purchases: Array<{ purchase: Purchase; remaining: number }>;
};

export default function PendingSupplierPayments({ purchases, isLoading, hasError = false }: {
  purchases: Purchase[];
  isLoading: boolean;
  hasError?: boolean;
}) {
  const suppliers = useMemo(() => {
    const groups = new Map<string, SupplierGroup>();
    for (const purchase of purchases) {
      const remaining = getOutstandingAmount(purchase);
      if (remaining <= 0) continue;

      const key = purchase.companyName.trim().toLocaleLowerCase();
      const group = groups.get(key) ?? { name: purchase.companyName.trim(), amount: 0, purchases: [] };
      group.amount += remaining;
      group.purchases.push({ purchase, remaining });
      groups.set(key, group);
    }

    return [...groups.values()]
      .map((group) => ({
        ...group,
        purchases: group.purchases.sort((a, b) => new Date(b.purchase.purchaseDate || b.purchase.createdAt).getTime() - new Date(a.purchase.purchaseDate || a.purchase.createdAt).getTime()),
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [purchases]);

  const totalOutstanding = suppliers.reduce((total, supplier) => total + supplier.amount, 0);

  return (
    <section aria-labelledby="pending-supplier-payments-title" className="mt-5 overflow-hidden rounded-xl border border-amber-200 bg-white shadow-[0_4px_18px_rgba(110,75,17,0.05)] sm:mt-6 sm:rounded-2xl">
      <div className="flex flex-col gap-3 border-b border-amber-100 bg-amber-50/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-800"><FiAlertCircle size={18} aria-hidden="true" /></span>
          <div>
            <h2 id="pending-supplier-payments-title" className="text-[15px] font-semibold text-[#4c3820]">Outstanding supplier payments</h2>
            <p className="mt-1 text-xs text-[#80683f]">Pending balances grouped by company and purchase invoice.</p>
          </div>
        </div>
        {!isLoading && !hasError && suppliers.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-white px-3 py-2 sm:text-right">
            <p className="text-[10px] font-medium text-[#80683f]">Total outstanding</p>
            <p className="mt-0.5 text-sm font-bold text-amber-900">{formatPrice(totalOutstanding)}</p>
          </div>
        )}
      </div>

      {isLoading ? (
        <div role="status" aria-label="Loading outstanding supplier payments" className="flex min-h-20 items-center justify-center text-amber-800">
          <FiLoader size={19} className="animate-spin" /><span className="sr-only">Loading outstanding supplier payments</span>
        </div>
      ) : hasError ? (
        <p role="status" className="px-4 py-6 text-center text-xs text-[#80683f]">Could not load outstanding balances. Refresh purchase data to try again.</p>
      ) : suppliers.length === 0 ? (
        <div className="flex items-center gap-2.5 px-4 py-5 text-sm text-[#356b57] sm:px-5">
          <FiCheckCircle size={17} aria-hidden="true" /> <span>All supplier purchases are paid. There are no pending balances.</span>
        </div>
      ) : (
        <div className="grid gap-3 p-3 sm:grid-cols-2 sm:p-4 xl:grid-cols-3">
          {suppliers.map((supplier) => (
            <article key={supplier.name.toLocaleLowerCase()} className="overflow-hidden rounded-xl border border-amber-200 bg-[#fffdf8]">
              <div className="flex items-start justify-between gap-3 border-b border-amber-100 bg-amber-50/50 px-3.5 py-3">
                <h3 className="min-w-0 break-words text-[13px] font-semibold text-[#4c3820]">{supplier.name}</h3>
                <span className="shrink-0 text-right text-[13px] font-bold text-amber-900">{formatPrice(supplier.amount)}</span>
              </div>
              <ul className="divide-y divide-amber-100 px-3.5">
                {supplier.purchases.map(({ purchase, remaining }) => (
                  <li key={purchase._id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-[#5f5140]">Invoice #{purchase._id.slice(-8).toUpperCase()}</p>
                      <p className="mt-0.5 text-[10px] text-[#927e61]">{formatDate(purchase.purchaseDate || purchase.createdAt)} · {purchase.category}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-amber-200 bg-amber-100/70 px-2 py-1 text-[10px] font-semibold text-amber-900">{formatPrice(remaining)} due</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
