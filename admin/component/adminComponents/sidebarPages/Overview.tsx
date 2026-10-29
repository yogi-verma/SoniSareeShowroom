"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FiAward, FiLoader, FiRefreshCw, FiShoppingBag } from "react-icons/fi";
import { getPurchases, getSalesTransactions } from "../../../utils/adminApi";
import type { Purchase, SalesTransaction } from "../../../utils/adminApi";
import SalesTrendChart from "./SalesTrendChart";

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function Overview({ adminName }: { adminName: string }) {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [transactions, setTransactions] = useState<SalesTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadOverview = useCallback(async () => {
    try {
      const [purchaseResult, salesResult] = await Promise.all([getPurchases(), getSalesTransactions()]);
      setPurchases(purchaseResult.purchases);
      setTransactions(salesResult.transactions);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load shop analytics.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;

    Promise.all([getPurchases(), getSalesTransactions()])
      .then(([purchaseResult, salesResult]) => {
        if (!isCurrent) return;
        setPurchases(purchaseResult.purchases);
        setTransactions(salesResult.transactions);
      })
      .catch((error: unknown) => {
        if (!isCurrent) return;
        setLoadError(error instanceof Error ? error.message : "Could not load shop analytics.");
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const salesTotals = useMemo(() => {
    const totals = { online: 0, cash: 0 };
    for (const transaction of transactions) {
      if (transaction.transactionType === "online") totals.online += transaction.amount;
      if (transaction.transactionType === "cash") totals.cash += transaction.amount;
    }
    return { ...totals, total: totals.online + totals.cash };
  }, [transactions]);

  const purchaseTotal = useMemo(
    () => purchases.reduce((total, purchase) => total + purchase.total_price, 0),
    [purchases],
  );

  const topSupplier = useMemo(() => {
    const suppliers = new Map<string, { name: string; amount: number; purchases: number }>();
    for (const purchase of purchases) {
      const key = purchase.companyName.trim().toLocaleLowerCase();
      const supplier = suppliers.get(key) ?? { name: purchase.companyName.trim(), amount: 0, purchases: 0 };
      supplier.amount += purchase.total_price;
      supplier.purchases += 1;
      suppliers.set(key, supplier);
    }
    return [...suppliers.values()].sort((first, second) => second.amount - first.amount)[0] ?? null;
  }, [purchases]);

  return (
    <div id="overview">
      <div className="mb-5 sm:mb-6">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold sm:text-xs">Shop overview</p>
        <h1 className="font-serif text-[28px] leading-tight sm:text-3xl lg:text-4xl">Welcome back, {adminName}</h1>
        <p className="mt-1.5 text-[13px] text-[#817982] sm:text-sm">A clear view of your showroom’s sales and purchasing.</p>
      </div>

      {loadError && (
        <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#f0d8d6] bg-[#fff6f5] px-4 py-3 text-xs text-[#a13d39]">
          <span>{loadError}</span>
          <button
            type="button"
            onClick={() => {
              setLoadError("");
              setIsLoading(true);
              void loadOverview();
            }}
            className="inline-flex items-center gap-1.5 font-semibold hover:underline"
          >
            <FiRefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      <section aria-label="All-time shop totals" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 sm:gap-4">
        <OverviewCard label="All-time sales" value={salesTotals.total} icon={FiShoppingBag} color="plum" isLoading={isLoading} hasError={Boolean(loadError)} />
        {/* <OverviewCard label="Online / UPI sales" value={salesTotals.online} icon={FiActivity} color="gold" isLoading={isLoading} hasError={Boolean(loadError)} /> */}
        {/* <OverviewCard label="Cash sales" value={salesTotals.cash} icon={FiDollarSign} color="green" isLoading={isLoading} hasError={Boolean(loadError)} /> */}
        <OverviewCard label="All-time purchasing" value={purchaseTotal} icon={FiShoppingBag} color="rose" isLoading={isLoading} hasError={Boolean(loadError)} />
      </section>

      <div className="mt-5 sm:mt-6">
        <SalesTrendChart transactions={transactions} isLoading={isLoading} />
      </div>

      <section className="mt-5 overflow-hidden rounded-xl border border-[#ece6df] bg-white shadow-[0_4px_18px_rgba(48,23,47,0.035)] sm:mt-6 sm:rounded-2xl">
        <div className="flex items-center gap-3 p-4 sm:p-5 md:p-6">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f8f3e9] text-[#9a733b] sm:h-12 sm:w-12 sm:rounded-2xl"><FiAward size={20} /></span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a07848]">Top wholesale supplier</p>
            {isLoading ? (
              <FiLoader role="status" aria-label="Loading top supplier" size={18} className="mt-2 animate-spin text-plum" />
            ) : loadError ? (
              <p className="mt-1 text-xs text-[#928a92]">Supplier data is unavailable.</p>
            ) : topSupplier ? (
              <>
                <h2 className="mt-1 truncate font-serif text-lg text-[#332a35] sm:text-xl">{topSupplier.name}</h2>
                <p className="mt-1 text-[11px] text-[#817982]">{topSupplier.purchases} {topSupplier.purchases === 1 ? "purchase" : "purchases"} · {formatPrice(topSupplier.amount)} total spend</p>
              </>
            ) : (
              <p className="mt-1 text-sm text-[#928a92]">No purchases recorded yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function OverviewCard({ label, value, icon: Icon, color, isLoading, hasError }: {
  label: string;
  value: number;
  icon: typeof FiShoppingBag;
  color: "plum" | "gold" | "green" | "rose";
  isLoading: boolean;
  hasError: boolean;
}) {
  const styles = {
    plum: "bg-[#f4edf3] text-plum",
    gold: "bg-[#f8f3e9] text-[#98713c]",
    green: "bg-[#eef7f3] text-[#356b57]",
    rose: "bg-[#fbefee] text-[#a54a4a]",
  };

  return (
    <article className="min-w-0 rounded-xl border border-[#ece6df] bg-white p-4 shadow-[0_4px_18px_rgba(48,23,47,0.025)] sm:rounded-2xl sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-[#817982]">{label}</p>
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${styles[color]}`}><Icon size={15} /></span>
      </div>
      <div className="mt-3 flex h-7 items-center text-lg font-semibold tracking-tight text-[#332a35] sm:text-xl">
        {isLoading ? <FiLoader role="status" aria-label={`Loading ${label}`} size={18} className="animate-spin text-plum" /> : hasError ? "—" : formatPrice(value)}
      </div>
    </article>
  );
}
