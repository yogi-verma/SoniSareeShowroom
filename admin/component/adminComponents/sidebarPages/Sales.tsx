"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  FiActivity,
  FiCalendar,
  FiDollarSign,
  FiLoader,
  FiPlus,
  FiRefreshCw,
  FiShoppingBag,
  FiTrendingDown,
  FiX,
} from "react-icons/fi";
import { createDailySales, getSalesTransactions } from "../../../utils/adminApi";
import type { SalesTransaction } from "../../../utils/adminApi";
import { useAccessibleDialog } from "../useAccessibleDialog";
import SalesTrendChart from "./SalesTrendChart";

function getLocalDate() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

function addDays(date: string, amount: number) {
  const result = new Date(`${date}T00:00:00.000Z`);
  result.setUTCDate(result.getUTCDate() + amount);
  return result.toISOString().slice(0, 10);
}

function createForm(date: string) {
  return { onlineAmount: "0", cashAmount: "0", miscellaneousAmount: "0", transactionDate: date };
}

const fieldClassName = "admin-field";

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value: string) {
  const date = value.length === 10 ? `${value}T00:00:00.000Z` : value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

type DayTotals = {
  online: number;
  cash: number;
  expense: number;
  hasOnline: boolean;
  hasCash: boolean;
  hasExpense: boolean;
  hasTransactions: boolean;
};

function emptyDay(): DayTotals {
  return { online: 0, cash: 0, expense: 0, hasOnline: false, hasCash: false, hasExpense: false, hasTransactions: false };
}

function summarizeTransactions(transactions: SalesTransaction[]) {
  const days = new Map<string, DayTotals>();

  for (const transaction of transactions) {
    const date = transaction.transactionDate.slice(0, 10);
    const day = days.get(date) ?? emptyDay();
    day.hasTransactions = true;

    if (transaction.transactionType === "online") {
      day.online += transaction.amount;
      day.hasOnline = true;
    } else if (transaction.transactionType === "cash") {
      day.cash += transaction.amount;
      day.hasCash = true;
    } else {
      day.expense += transaction.amount;
      day.hasExpense = true;
    }

    days.set(date, day);
  }

  return days;
}

export default function Sales() {
  const [today] = useState(getLocalDate);
  const [selectedDate, setSelectedDate] = useState(getLocalDate);
  const [transactions, setTransactions] = useState<SalesTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(() => createForm(getLocalDate()));
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const dialogRef = useAccessibleDialog(isModalOpen, isSaving, closeModal);

  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const result = await getSalesTransactions();
      setTransactions(result.transactions);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load sales transactions.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;
    getSalesTransactions()
      .then((result) => {
        if (isCurrent) setTransactions(result.transactions);
      })
      .catch((error: unknown) => {
        if (isCurrent) setLoadError(error instanceof Error ? error.message : "Could not load sales transactions.");
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timeoutId = window.setTimeout(() => setNotice(""), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  const days = useMemo(() => summarizeTransactions(transactions), [transactions]);
  const recentDates = useMemo(
    () => Array.from({ length: 10 }, (_, index) => addDays(today, index - 9)).reverse(),
    [today],
  );
  const allTime = useMemo(() => {
    const totals = { online: 0, cash: 0 };
    for (const transaction of transactions) {
      if (transaction.transactionType === "online") totals.online += transaction.amount;
      if (transaction.transactionType === "cash") totals.cash += transaction.amount;
    }
    return { ...totals, total: totals.online + totals.cash };
  }, [transactions]);
  const selectedDay = days.get(selectedDate) ?? emptyDay();

  function openModal() {
    setNotice("");
    setFormError("");
    setForm(createForm(selectedDate));
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSaving) return;
    setIsModalOpen(false);
    setFormError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setNotice("");
    setIsSaving(true);

    const dailySales = {
      onlineAmount: Number(form.onlineAmount),
      cashAmount: Number(form.cashAmount),
      miscellaneousAmount: Number(form.miscellaneousAmount),
      transactionDate: form.transactionDate,
    };

    if (dailySales.onlineAmount === 0 && dailySales.cashAmount === 0 && dailySales.miscellaneousAmount === 0) {
      setFormError("Enter an amount for at least one field.");
      setIsSaving(false);
      return;
    }

    try {
      await createDailySales(dailySales);
      setIsModalOpen(false);
      setSelectedDate(form.transactionDate);
      setNotice("Daily sales recorded successfully.");
      await loadTransactions();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not record daily sales.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <p className="admin-page-kicker">Shop performance</p>
          <h1 className="admin-page-title">Sales</h1>
          <p className="admin-page-description">Review collections, daily totals, and shop expenses.</p>
        </div>
        <button
          type="button"
          onClick={openModal}
          className="admin-button-primary"
        >
          <FiPlus size={16} /> Enter daily sales
        </button>
      </div>

      {notice && <p role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">{notice}</p>}

      <section aria-label="All-time sales" className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard label="All-time total sales" amount={allTime.total} icon={FiShoppingBag} accent="plum" loading={isLoading} />
        <SummaryCard label="Online / UPI sales" amount={allTime.online} icon={FiActivity} accent="gold" loading={isLoading} />
        <SummaryCard label="Cash sales" amount={allTime.cash} icon={FiDollarSign} accent="plum" loading={isLoading} />
      </section>

      <section className="admin-panel mb-5 overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-5 sm:py-4 md:px-6">
          <div>
            <h2 className="admin-panel-title">Last 10 days</h2>
            <p className="admin-panel-description">Daily online, cash, expenses, and total sales</p>
          </div>
          <button
            type="button"
            onClick={() => void loadTransactions()}
            disabled={isLoading}
            aria-label="Refresh sales"
            className="admin-icon-button border-[var(--admin-border-strong)] disabled:opacity-50"
          >
            <FiRefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>

        {loadError && (
          <div className="border-t border-[#f0ece8] px-5 py-5 text-center">
            <p role="alert" className="text-xs text-red-700">{loadError}</p>
            <button type="button" onClick={() => void loadTransactions()} className="mt-2 text-xs font-semibold text-plum hover:underline">Try again</button>
          </div>
        )}

        {!loadError && isLoading ? (
          <div className="border-t border-[#f0ece8] px-5 py-8"><LoadingSpinner label="Loading daily sales" /></div>
        ) : !loadError && (
          <>
            <div className="divide-y divide-[#f2eeea] border-t border-[#f0ece8] sm:hidden">
              {recentDates.map((date) => <DailySalesCard key={date} date={date} totals={days.get(date)} />)}
            </div>
            <div className="hidden overflow-x-auto border-t border-[#f0ece8] sm:block">
              <table className="admin-table min-w-[620px]">
                <thead className="bg-[#fcfbf9] text-[10px] uppercase tracking-[0.12em] text-[#968d96]">
                  <tr>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 text-right font-medium">Total sales</th>
                    <th className="px-4 py-3 text-right font-medium">Online</th>
                    <th className="px-4 py-3 text-right font-medium">Cash</th>
                    <th className="px-5 py-3 text-right font-medium">Expense</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2eeea]">
                  {recentDates.map((date) => <DailySalesRow key={date} date={date} totals={days.get(date)} />)}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <SalesTrendChart transactions={transactions} isLoading={isLoading} />

      <section className="admin-panel overflow-hidden">
        <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4 md:px-6">
          <div>
            <h2 className="admin-panel-title">Sales by date</h2>
            <p className="admin-panel-description">Choose any date to see its complete breakdown.</p>
          </div>
          <div className="relative w-full sm:w-auto">
            <input
              aria-label="Select a date to view sales"
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className={`${fieldClassName} pr-10 sm:w-[190px]`}
            />
            <FiCalendar aria-hidden="true" size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#817982]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-[#f0ece8] p-4 sm:grid-cols-4 sm:gap-4 sm:p-5 md:p-6">
          <SelectedDayCard label="Total sales" amount={selectedDay.online + selectedDay.cash} hasValue={selectedDay.hasOnline || selectedDay.hasCash} icon={FiShoppingBag} loading={isLoading} />
          <SelectedDayCard label="Online / UPI" amount={selectedDay.online} hasValue={selectedDay.hasOnline} icon={FiActivity} loading={isLoading} />
          <SelectedDayCard label="Cash" amount={selectedDay.cash} hasValue={selectedDay.hasCash} icon={FiDollarSign} loading={isLoading} />
          <SelectedDayCard label="Expense" amount={selectedDay.expense} hasValue={selectedDay.hasExpense} icon={FiTrendingDown} expense loading={isLoading} />
        </div>
        {!selectedDay.hasTransactions && !isLoading && !loadError && (
          <p className="px-4 pb-4 text-[11px] text-[#928a92] sm:px-6 sm:pb-5">No sales or expenses were recorded for {formatDate(selectedDate)}.</p>
        )}
      </section>

      {isModalOpen && (
        <div
          className="admin-modal-backdrop"
          onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}
        >
          <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="sales-modal-title" className="admin-modal relative p-5 sm:p-6">
            <button type="button" onClick={closeModal} disabled={isSaving} aria-label="Close daily sales form" className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-[#7c737d] transition hover:bg-[#f3eef2] hover:text-plum disabled:opacity-50 sm:right-4 sm:top-4">
              <FiX size={18} />
            </button>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a07848]">Daily register</p>
            <h2 id="sales-modal-title" className="mt-1.5 font-serif text-xl text-[#2b202c] sm:text-2xl">Enter daily sales</h2>
            <p className="mt-1 text-xs leading-5 text-[#817982] sm:text-sm">Enter all collections and shop expenses together.</p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <AmountField label="Online / UPI" id="sales-online" value={form.onlineAmount} onChange={(value) => setForm({ ...form, onlineAmount: value })} />
                <AmountField label="Cash" id="sales-cash" value={form.cashAmount} onChange={(value) => setForm({ ...form, cashAmount: value })} />
                <AmountField label="Miscellaneous" id="sales-miscellaneous" hint="Tea, cold drinks, and other shop expenses" value={form.miscellaneousAmount} onChange={(value) => setForm({ ...form, miscellaneousAmount: value })} />
                <div>
                  <label htmlFor="sales-date" className="mb-1.5 block text-xs font-semibold text-[#514852]">Date <span className="text-red-600">*</span></label>
                  <div className="relative">
                    <input id="sales-date" type="date" required value={form.transactionDate} onChange={(event) => setForm({ ...form, transactionDate: event.target.value })} className={`${fieldClassName} pr-10`} />
                    <FiCalendar aria-hidden="true" size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#817982]" />
                  </div>
                </div>
              </div>

              {formError && <p role="alert" className="rounded-lg border border-[#f0d8d6] bg-[#fff6f5] px-3.5 py-3 text-xs text-[#a13d39]">{formError}</p>}

              <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end sm:gap-3">
                <button type="button" onClick={closeModal} disabled={isSaving} className="admin-button-secondary">Cancel</button>
                <button type="submit" disabled={isSaving} className="admin-button-primary">
                  {isSaving && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
                  {isSaving ? "Saving daily sales…" : "Save daily sales"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, amount, icon: Icon, accent, loading = false }: {
  label: string;
  amount: number;
  icon: typeof FiShoppingBag;
  accent: "plum" | "gold";
  loading?: boolean;
}) {
  const colors = { plum: "bg-[#f4edf3] text-plum", gold: "bg-[#f8f3e9] text-[#a07848]" };
  return (
    <article className="admin-panel min-w-0 p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-medium leading-4 text-[#817982] sm:text-xs">{label}</p>
        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${colors[accent]} sm:h-8 sm:w-8`}><Icon size={14} aria-hidden="true" /></span>
      </div>
      <p className="mt-2 flex h-6 items-center text-[15px] font-semibold tracking-tight text-[#332a35] sm:text-lg">{loading ? <FiLoader role="status" aria-label={`Loading ${label}`} className="animate-spin text-plum" size={18} /> : formatPrice(amount)}</p>
    </article>
  );
}

function DailySalesRow({ date, totals }: { date: string; totals?: DayTotals }) {
  const hasSales = Boolean(totals?.hasOnline || totals?.hasCash);
  return (
    <tr className="text-[#554e57]">
      <td className="px-5 py-3.5 font-medium text-[#332a35]">{formatDate(date)}</td>
      <td className="px-4 py-3.5 text-right font-semibold text-[#332a35]">{hasSales ? formatPrice((totals?.online ?? 0) + (totals?.cash ?? 0)) : "—"}</td>
      <td className="px-4 py-3.5 text-right"><AmountBadge amount={totals?.online} visible={Boolean(totals?.hasOnline)} kind="online" /></td>
      <td className="px-4 py-3.5 text-right"><AmountBadge amount={totals?.cash} visible={Boolean(totals?.hasCash)} kind="cash" /></td>
      <td className="px-5 py-3.5 text-right"><AmountBadge amount={totals?.expense} visible={Boolean(totals?.hasExpense)} kind="expense" /></td>
    </tr>
  );
}

function DailySalesCard({ date, totals }: { date: string; totals?: DayTotals }) {
  const hasSales = Boolean(totals?.hasOnline || totals?.hasCash);
  return (
    <article className="px-4 py-3.5">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-[#332a35]">{formatDate(date)}</p>
        <p className="text-xs font-semibold text-plum">{hasSales ? formatPrice((totals?.online ?? 0) + (totals?.cash ?? 0)) : "—"}</p>
      </div>
      <div className="grid grid-cols-3 gap-2 text-[10px]">
        <span className="text-[#928a92]">Online <span className="mt-1 block"><AmountBadge amount={totals?.online} visible={Boolean(totals?.hasOnline)} kind="online" /></span></span>
        <span className="text-[#928a92]">Cash <span className="mt-1 block"><AmountBadge amount={totals?.cash} visible={Boolean(totals?.hasCash)} kind="cash" /></span></span>
        <span className="text-[#928a92]">Expense <span className="mt-1 block"><AmountBadge amount={totals?.expense} visible={Boolean(totals?.hasExpense)} kind="expense" /></span></span>
      </div>
    </article>
  );
}

function SelectedDayCard({ label, amount, hasValue, icon: Icon, expense = false, loading = false }: {
  label: string;
  amount: number;
  hasValue: boolean;
  icon: typeof FiShoppingBag;
  expense?: boolean;
  loading?: boolean;
}) {
  return (
    <article className="admin-panel min-w-0 bg-[#fffdfa] p-3 sm:p-4">
      <div className="flex items-center gap-1.5 text-[10px] text-[#817982] sm:text-xs"><Icon size={13} aria-hidden="true" />{label}</div>
      <p className={`mt-2 flex h-5 items-center text-sm font-semibold sm:text-base ${expense ? "text-[#a54a4a]" : "text-[#332a35]"}`}>{loading ? <FiLoader aria-label="Loading" className="animate-spin text-plum" size={16} /> : hasValue ? formatPrice(amount) : "—"}</p>
    </article>
  );
}

function AmountBadge({ amount, visible, kind }: {
  amount?: number;
  visible: boolean;
  kind: "online" | "cash" | "expense";
}) {
  if (!visible || amount === undefined) return <span className="text-[#a49ca4]">—</span>;

  const styles = {
    online: "border-[#e5d3e2] bg-[#f7eff6] text-[#62385f]",
    cash: "border-[#cfe4dc] bg-[#eef7f3] text-[#356b57]",
    expense: "border-[#f0d5d2] bg-[#fff2f0] text-[#a54a4a]",
  };
  return <span className={`admin-badge whitespace-nowrap ${styles[kind]}`}>{formatPrice(amount)}</span>;
}

function LoadingSpinner({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className="flex min-h-12 items-center justify-center text-plum">
      <FiLoader size={20} className="animate-spin" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

function AmountField({ label, id, value, onChange, hint }: {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-[#514852]">{label} (₹)</label>
      <input id={id} type="number" min="0" step="1" value={value} onChange={(event) => onChange(event.target.value)} placeholder="0" className={fieldClassName} />
      {hint && <p className="mt-1 text-[10px] text-[#928a92]">{hint}</p>}
    </div>
  );
}
