"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  FiActivity,
  FiCalendar,
  FiChevronDown,
  FiDollarSign,
  FiPlus,
  FiRefreshCw,
  FiShoppingBag,
  FiTrendingDown,
  FiX,
} from "react-icons/fi";
import {
  createSalesTransaction,
  getSalesTransactions,
} from "../../../utils/adminApi";
import type {
  SalesTransaction,
  SalesTransactionInput,
  SalesTransactionType,
} from "../../../utils/adminApi";

const transactionTypes: { value: SalesTransactionType; label: string }[] = [
  { value: "online", label: "Online / UPI" },
  { value: "cash", label: "Cash" },
  { value: "expense", label: "Miscellaneous expense" },
];

function getLocalDate() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

function createForm(date: string) {
  return { transactionType: "online" as SalesTransactionType, amount: "", description: "", transactionDate: date };
}

const fieldClassName = "w-full rounded-xl border border-[#e6dfe5] bg-white px-3.5 py-3 text-sm text-[#332a35] outline-none transition placeholder:text-[#b0a8b0] hover:border-[#d1c2cf] focus:border-[#a87c9e] focus:ring-4 focus:ring-[#a87c9e]/10";

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
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

function getTypeLabel(type: SalesTransactionType) {
  return transactionTypes.find((item) => item.value === type)?.label ?? type;
}

export default function Sales() {
  const [selectedDate, setSelectedDate] = useState(getLocalDate);
  const [transactions, setTransactions] = useState<SalesTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(() => createForm(getLocalDate()));
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  const loadTransactions = useCallback(async (date: string) => {
    setIsLoading(true);
    setLoadError("");
    try {
      const result = await getSalesTransactions(date);
      setTransactions(result.transactions);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load sales transactions.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTransactions(selectedDate);
  }, [loadTransactions, selectedDate]);

  const totals = useMemo(() => {
    const online = transactions.filter((item) => item.transactionType === "online").reduce((sum, item) => sum + item.amount, 0);
    const cash = transactions.filter((item) => item.transactionType === "cash").reduce((sum, item) => sum + item.amount, 0);
    const expenses = transactions.filter((item) => item.transactionType === "expense").reduce((sum, item) => sum + item.amount, 0);
    return { online, cash, expenses, sales: online + cash, net: online + cash - expenses };
  }, [transactions]);

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

    const transaction: SalesTransactionInput = {
      transactionType: form.transactionType,
      amount: Number(form.amount),
      description: form.description.trim(),
      transactionDate: form.transactionDate,
    };

    try {
      await createSalesTransaction(transaction);
      setIsModalOpen(false);
      setSelectedDate(form.transactionDate);
      setNotice("Transaction recorded successfully.");
      if (form.transactionDate === selectedDate) {
        void loadTransactions(selectedDate);
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not record the transaction.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:mb-6 sm:flex-row sm:items-end sm:gap-4">
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold sm:mb-2 sm:text-xs sm:tracking-[0.22em]">Daily close</p>
          <h1 className="font-serif text-[28px] leading-tight sm:text-3xl lg:text-4xl">Sales</h1>
          <p className="mt-1.5 max-w-xl text-[13px] leading-5 text-[#817982] sm:mt-2 sm:text-sm">Track daily collections and day-to-day shop expenses.</p>
        </div>
        <button
          type="button"
          onClick={openModal}
          className="inline-flex w-fit items-center gap-2 rounded-lg bg-plum px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#432140] sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm"
        >
          <FiPlus size={16} /> Record transaction
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-2 rounded-xl border border-[#ece6df] bg-white p-3.5 sm:mb-5 sm:flex-row sm:items-center sm:justify-between sm:rounded-2xl sm:px-5 sm:py-3.5">
        <div>
          <p className="text-xs font-semibold text-[#514852]">Showing transactions for</p>
          <p className="mt-0.5 text-[11px] text-[#928a92]">Choose a date to review the shop’s daily totals.</p>
        </div>
        <div className="relative w-full sm:w-auto">
          <input
            aria-label="Filter sales by date"
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className={`${fieldClassName} pr-10 sm:w-[190px]`}
          />
          <FiCalendar aria-hidden="true" size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#817982]" />
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4 sm:gap-4">
        <SummaryCard label="Total sales" amount={totals.sales} icon={FiShoppingBag} accent="plum" />
        <SummaryCard label="Online / UPI" amount={totals.online} icon={FiActivity} accent="gold" />
        <SummaryCard label="Cash collected" amount={totals.cash} icon={FiDollarSign} accent="plum" />
        <SummaryCard label="Shop expenses" amount={totals.expenses} icon={FiTrendingDown} accent="rose" />
      </div>

      <section className="overflow-hidden rounded-xl border border-[#ece6df] bg-white shadow-[0_4px_18px_rgba(48,23,47,0.035)] sm:rounded-2xl">
        <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4 md:px-6">
          <div>
            <h2 className="font-serif text-lg sm:text-xl">Transaction history</h2>
            <p className="mt-1 text-[11px] text-[#928a92] sm:text-xs">{formatDate(selectedDate)} <span aria-hidden="true">·</span> {transactions.length} {transactions.length === 1 ? "entry" : "entries"}</p>
          </div>
          <button
            type="button"
            onClick={() => void loadTransactions(selectedDate)}
            disabled={isLoading}
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#e6dfd8] px-3 py-2 text-[11px] font-medium text-[#514952] transition hover:bg-[#faf8f5] disabled:opacity-50 sm:text-xs"
          >
            <FiRefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {notice && <p role="status" className="mx-4 mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-800 sm:mx-5">{notice}</p>}

        {loadError ? (
          <div className="border-t border-[#f0ece8] px-5 py-10 text-center">
            <p role="alert" className="text-sm text-red-700">{loadError}</p>
            <button type="button" onClick={() => void loadTransactions(selectedDate)} className="mt-3 text-xs font-semibold text-plum hover:underline">Try again</button>
          </div>
        ) : isLoading ? (
          <div className="border-t border-[#f0ece8] px-5 py-10 text-center text-sm text-[#928a92]">Loading transactions…</div>
        ) : transactions.length === 0 ? (
          <div className="border-t border-[#f0ece8] px-5 py-12 text-center">
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-[#f6f0f5] text-plum"><FiShoppingBag size={18} /></span>
            <h3 className="mt-3 font-serif text-base">No transactions for this date</h3>
            <p className="mt-1 text-xs text-[#928a92]">Record the day’s sales or shop expenses to get started.</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-[#f2eeea] border-t border-[#f0ece8] sm:hidden">
              {transactions.map((transaction) => <TransactionCard key={transaction._id} transaction={transaction} />)}
            </div>
            <div className="hidden overflow-x-auto border-t border-[#f0ece8] sm:block">
              <table className="w-full min-w-[620px] text-left text-xs">
                <thead className="bg-[#fcfbf9] text-[10px] uppercase tracking-[0.12em] text-[#968d96]">
                  <tr>
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Description</th>
                    <th className="px-4 py-3 text-right font-medium">Amount</th>
                    <th className="px-5 py-3 text-right font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2eeea]">
                  {transactions.map((transaction) => (
                    <tr key={transaction._id} className="text-[#554e57]">
                      <td className="px-5 py-3.5"><TransactionBadge type={transaction.transactionType} /></td>
                      <td className="max-w-[360px] truncate px-4 py-3.5" title={transaction.description || undefined}>{transaction.description || "—"}</td>
                      <td className={`px-4 py-3.5 text-right font-semibold ${transaction.transactionType === "expense" ? "text-[#a54a4a]" : "text-[#332a35]"}`}>{transaction.transactionType === "expense" ? "−" : ""}{formatPrice(transaction.amount)}</td>
                      <td className="px-5 py-3.5 text-right text-[#817982]">{formatDate(transaction.transactionDate)}</td>
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
          onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="sales-modal-title" className="relative my-auto max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-xl border border-[#eadfe8] bg-[#fffdfa] p-5 shadow-2xl shadow-black/25 sm:max-h-[calc(100dvh-3rem)] sm:rounded-2xl sm:p-7">
            <button type="button" onClick={closeModal} disabled={isSaving} aria-label="Close transaction form" className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-[#7c737d] transition hover:bg-[#f3eef2] hover:text-plum disabled:opacity-50 sm:right-4 sm:top-4">
              <FiX size={18} />
            </button>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a07848]">Daily register</p>
            <h2 id="sales-modal-title" className="mt-1.5 font-serif text-xl text-[#2b202c] sm:text-2xl">Record a transaction</h2>
            <p className="mt-1 text-xs leading-5 text-[#817982] sm:text-sm">Add a sale collection or a miscellaneous shop expense.</p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label htmlFor="sales-type" className="mb-1.5 block text-xs font-semibold text-[#514852]">Transaction type <span className="text-red-600">*</span></label>
                <div className="relative">
                  <select id="sales-type" required value={form.transactionType} onChange={(event) => setForm({ ...form, transactionType: event.target.value as SalesTransactionType })} className={`${fieldClassName} appearance-none pr-10`}>
                    {transactionTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                  </select>
                  <FiChevronDown aria-hidden="true" size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#817982]" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="sales-amount" className="mb-1.5 block text-xs font-semibold text-[#514852]">Amount (₹) <span className="text-red-600">*</span></label>
                  <input id="sales-amount" type="number" required min="0.01" step="0.01" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="0.00" className={fieldClassName} />
                </div>
                <div>
                  <label htmlFor="sales-date" className="mb-1.5 block text-xs font-semibold text-[#514852]">Transaction date <span className="text-red-600">*</span></label>
                  <div className="relative">
                    <input id="sales-date" type="date" required value={form.transactionDate} onChange={(event) => setForm({ ...form, transactionDate: event.target.value })} className={`${fieldClassName} pr-10`} />
                    <FiCalendar aria-hidden="true" size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#817982]" />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="sales-description" className="mb-1.5 block text-xs font-semibold text-[#514852]">
                  {form.transactionType === "expense" ? "Expense details" : "Notes"}{form.transactionType === "expense" && <span className="text-red-600"> *</span>}
                </label>
                <textarea id="sales-description" rows={3} maxLength={500} required={form.transactionType === "expense"} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder={form.transactionType === "expense" ? "For example, tea and cold drinks" : "Optional sale notes"} className={`${fieldClassName} resize-y`} />
              </div>

              {formError && <p role="alert" className="rounded-lg border border-[#f0d8d6] bg-[#fff6f5] px-3.5 py-3 text-xs text-[#a13d39]">{formError}</p>}

              <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end sm:gap-3">
                <button type="button" onClick={closeModal} disabled={isSaving} className="rounded-lg border border-[#e6dfe5] px-4 py-2.5 text-sm font-medium text-[#625a63] transition hover:bg-[#faf8f5] disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-plum px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#432140] disabled:cursor-wait disabled:opacity-65">
                  {isSaving && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
                  {isSaving ? "Saving…" : "Save transaction"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, amount, icon: Icon, accent }: {
  label: string;
  amount: number;
  icon: typeof FiShoppingBag;
  accent: "plum" | "gold" | "rose";
}) {
  const colors = {
    plum: "bg-[#f4edf3] text-plum",
    gold: "bg-[#f8f3e9] text-[#a07848]",
    rose: "bg-[#fbefee] text-[#a54a4a]",
  };

  return (
    <article className="min-w-0 rounded-xl border border-[#ece6df] bg-white p-3.5 shadow-[0_4px_18px_rgba(48,23,47,0.025)] sm:rounded-2xl sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-medium leading-4 text-[#817982] sm:text-xs">{label}</p>
        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${colors[accent]} sm:h-8 sm:w-8`}><Icon size={14} aria-hidden="true" /></span>
      </div>
      <p className="mt-2 truncate text-[15px] font-semibold tracking-tight text-[#332a35] sm:text-lg">{formatPrice(amount)}</p>
    </article>
  );
}

function TransactionBadge({ type }: { type: SalesTransactionType }) {
  const color = type === "expense" ? "bg-[#fbefee] text-[#a54a4a]" : type === "online" ? "bg-[#f4edf3] text-plum" : "bg-[#f8f3e9] text-[#8f6b37]";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium ${color}`}>{getTypeLabel(type)}</span>;
}

function TransactionCard({ transaction }: { transaction: SalesTransaction }) {
  return (
    <article className="px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <TransactionBadge type={transaction.transactionType} />
          {transaction.description && <p className="mt-2 truncate text-xs text-[#554e57]">{transaction.description}</p>}
        </div>
        <p className={`shrink-0 text-sm font-semibold ${transaction.transactionType === "expense" ? "text-[#a54a4a]" : "text-[#332a35]"}`}>{transaction.transactionType === "expense" ? "−" : ""}{formatPrice(transaction.amount)}</p>
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-[10px] text-[#928a92]"><FiCalendar size={12} aria-hidden="true" />{formatDate(transaction.transactionDate)}</p>
    </article>
  );
}
