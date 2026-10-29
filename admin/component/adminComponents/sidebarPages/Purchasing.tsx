"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { FiArrowLeft, FiCalendar, FiChevronDown, FiDownload, FiLoader, FiMapPin, FiPlus, FiRefreshCw, FiShoppingBag, FiTrash2, FiX } from "react-icons/fi";
import { addPurchasePayment, createPurchase, getPurchases } from "../../../utils/adminApi";
import type { Purchase, PurchaseInput, PurchasePaymentMethod } from "../../../utils/adminApi";
import { useAccessibleDialog } from "../useAccessibleDialog";
import PendingSupplierPayments from "./PendingSupplierPayments";

const places = ["Charkhi Dardi", "Surat", "Jaipur", "Bhiwani", "Rohtak"];
const categories = ["shut", "saree", "rajputi poshak"];

function createEmptyItem(id: string) {
  return { id, name: "", description: "", quantity: "1", per_price: "" };
}

function createEmptyForm() {
  const today = new Date();
  return {
    companyName: "",
    place: "",
    category: "",
    items: [createEmptyItem("initial-item")],
    addGst: false,
    gstPercent: "5",
    initialPaidAmount: "0",
    paymentMethod: "cash" as PurchasePaymentMethod,
    purchaseDate: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`,
  };
}

const fieldClassName = "admin-field";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
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

function roundMoney(value: number) {
  return Math.round(value);
}

function getPaidAmount(purchase: Purchase) {
  return purchase.paidAmount ?? purchase.payments?.reduce((total, payment) => total + payment.amount, 0) ?? 0;
}

function getRemainingAmount(purchase: Purchase) {
  return Math.max(purchase.total_price - getPaidAmount(purchase), 0);
}

function getPaymentStatus(purchase: Purchase): "paid" | "pending" {
  return purchase.paymentStatus ?? (getRemainingAmount(purchase) === 0 ? "paid" : "pending");
}

function paymentMethodLabel(method: PurchasePaymentMethod) {
  return method === "online" ? "Online / UPI" : method === "cheque" ? "Cheque" : "Cash";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

function saveInvoiceAsPdf(purchase: Purchase, companyName: string) {
  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) {
    window.alert("Allow pop-ups to open the invoice and save it as a PDF.");
    return;
  }

  const rows = purchase.items?.length
    ? purchase.items.map((item) => `
      <tr>
        <td><strong>${escapeHtml(item.name)}</strong>${item.description ? `<small>${escapeHtml(item.description)}</small>` : ""}</td>
        <td class="number">${item.quantity}</td>
        <td class="number">${formatPrice(item.per_price)}</td>
        <td class="number">${formatPrice(item.total ?? item.quantity * item.per_price)}</td>
      </tr>`).join("")
    : `<tr><td><strong>${escapeHtml(purchase.description || "Purchase")}</strong></td><td class="number">—</td><td class="number">—</td><td class="number">${formatPrice(purchase.total_price)}</td></tr>`;
  const date = formatDate(purchase.purchaseDate || purchase.createdAt);
  const gstAmount = purchase.gstAmount ?? 0;
  const subtotal = purchase.subtotal ?? purchase.total_price - gstAmount;
  const paidAmount = getPaidAmount(purchase);
  const remainingAmount = getRemainingAmount(purchase);
  const paymentRows = purchase.payments?.map((payment) => `<div class="totalrow"><span>${escapeHtml(paymentMethodLabel(payment.method))} · ${escapeHtml(formatDate(payment.paidAt))}</span><strong>${formatPrice(payment.amount)}</strong></div>`).join("") ?? "";

  printWindow.document.write(`<!doctype html>
    <html><head><meta charset="utf-8"><title>Invoice - ${escapeHtml(companyName)}</title>
    <style>
      *{box-sizing:border-box}body{margin:0;padding:36px;background:#f4f1ec;color:#2f2630;font:14px Arial,sans-serif}
      .sheet{position:relative;max-width:800px;min-height:980px;margin:auto;padding:44px 48px;background:#fff;border:1px solid #e9e1d8}
      .top{display:flex;justify-content:space-between;gap:24px;border-bottom:2px solid #351a32;padding-bottom:22px}
      .eyebrow{color:#a37b45;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase}
      h1{margin:8px 0;font-family:Georgia,serif;font-size:32px;font-weight:normal}p{margin:5px 0;color:#716873}
      .billto{margin:28px 0}.billto strong{display:block;margin-top:8px;font-size:20px}
      .meta{display:flex;gap:32px;margin:22px 0;padding:14px 0;border-top:1px solid #eee8e2;border-bottom:1px solid #eee8e2}
      .meta span{display:block;margin-bottom:4px;color:#928a92;font-size:10px;letter-spacing:1px;text-transform:uppercase}
      table{width:100%;border-collapse:collapse;margin-top:22px}th{padding:11px 8px;background:#f8f5f1;color:#756b76;font-size:10px;letter-spacing:1px;text-align:left;text-transform:uppercase}
      td{padding:13px 8px;border-bottom:1px solid #eee8e2;vertical-align:top}td small{display:block;margin-top:5px;color:#837a84}.number{text-align:right;white-space:nowrap}
      .totals{width:290px;margin:22px 0 0 auto}.totalrow{display:flex;justify-content:space-between;padding:7px 0;color:#716873}.grand{margin-top:7px;padding-top:12px;border-top:2px solid #351a32;color:#351a32;font-size:18px;font-weight:bold}
      .stamp{position:absolute;right:48px;bottom:56px;width:180px;height:110px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:2px solid #8c3548;border-radius:50%;color:#8c3548;text-align:center;transform:rotate(-8deg);font-weight:bold;letter-spacing:1px}
      .stamp small{margin-top:6px;font-size:10px;font-weight:normal;letter-spacing:.5px}.footer{position:absolute;left:48px;bottom:38px;color:#9a929a;font-size:10px}
      @page{size:A4;margin:12mm}@media print{body{padding:0;background:#fff}.sheet{max-width:none;min-height:270mm;border:0;padding:12mm}.stamp{right:12mm;bottom:18mm}.footer{left:12mm;bottom:10mm}}
    </style></head><body><main class="sheet">
      <header class="top"><div><div class="eyebrow">Purchase invoice</div><h1>${escapeHtml(companyName)}</h1><p>Supplier purchase record</p></div><div style="text-align:right"><div class="eyebrow">Invoice</div><p>#${escapeHtml(purchase._id.slice(-8).toUpperCase())}</p><p>${escapeHtml(date)}</p></div></header>
      <section class="billto"><div class="eyebrow">Purchased by</div><strong>Soni Saree Showroom</strong><p>Akoda, M/garh</p></section>
      <section class="meta"><div><span>Category</span>${escapeHtml(purchase.category)}</div><div><span>Supplier location</span>${escapeHtml(purchase.place)}</div><div><span>Purchase date</span>${escapeHtml(date)}</div></section>
      <table><thead><tr><th>Item</th><th class="number">Quantity</th><th class="number">Per price</th><th class="number">Amount</th></tr></thead><tbody>${rows}</tbody></table>
      <section class="totals"><div class="totalrow"><span>Subtotal</span><strong>${formatPrice(subtotal)}</strong></div>${(purchase.gstPercent ?? 0) > 0 ? `<div class="totalrow"><span>GST (${purchase.gstPercent}%)</span><strong>${formatPrice(gstAmount)}</strong></div>` : ""}<div class="totalrow grand"><span>Total amount</span><span>${formatPrice(purchase.total_price)}</span></div><div class="totalrow"><span>Paid so far</span><strong>${formatPrice(paidAmount)}</strong></div>${paymentRows}<div class="totalrow"><span>Balance due</span><strong>${formatPrice(remainingAmount)}</strong></div></section>
      <div class="stamp">SONI SAREE SHOWROOM<small>AKODA · M/GARH</small></div><div class="footer">Generated from Soni Saree Showroom admin workspace</div>
    </main><script>window.addEventListener('load',()=>setTimeout(()=>window.print(),250));</script></body></html>`);
  printWindow.document.close();
  printWindow.opener = null;
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
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [form, setForm] = useState(createEmptyForm);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedSupplierKey, setSelectedSupplierKey] = useState<string | null>(null);
  const [payingPurchase, setPayingPurchase] = useState<Purchase | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PurchasePaymentMethod>("cash");
  const [clearAllBalance, setClearAllBalance] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const dialogRef = useAccessibleDialog(isModalOpen, isSaving, closeModal);
  const paymentDialogRef = useAccessibleDialog(Boolean(payingPurchase), isSavingPayment, closePaymentModal);
  const subtotal = useMemo(
    () => roundMoney(form.items.reduce((total, item) => total + (Number(item.quantity) || 0) * (Number(item.per_price) || 0), 0)),
    [form.items],
  );
  const gstAmount = form.addGst ? roundMoney(subtotal * Number(form.gstPercent) / 100) : 0;
  const grandTotal = roundMoney(subtotal + gstAmount);
  const initialPaidAmount = Math.max(Number(form.initialPaidAmount) || 0, 0);
  const initialRemainingAmount = Math.max(grandTotal - initialPaidAmount, 0);
  const currentPaymentRemaining = payingPurchase ? getRemainingAmount(payingPurchase) : 0;
  const paymentAmountValue = Number(paymentAmount) || 0;
  const remainingAfterPayment = Math.max(currentPaymentRemaining - paymentAmountValue, 0);

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

  const loadPurchases = useCallback(async () => {
    try {
      const result = await getPurchases();
      setPurchases(result.purchases);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load purchases.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  function refreshPurchases() {
    setIsLoading(true);
    setLoadError("");
    void loadPurchases();
  }

  useEffect(() => {
    let isCurrent = true;
    getPurchases()
      .then((result) => {
        if (isCurrent) setPurchases(result.purchases);
      })
      .catch((error: unknown) => {
        if (isCurrent) setLoadError(error instanceof Error ? error.message : "Could not load purchases.");
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

  function closeModal() {
    if (isSaving) return;
    setIsModalOpen(false);
    setForm(createEmptyForm());
    setFormError("");
  }

  function openPaymentModal(purchase: Purchase) {
    setPayingPurchase(purchase);
    setPaymentAmount("");
    setPaymentMethod("cash");
    setClearAllBalance(false);
    setPaymentError("");
  }

  function closePaymentModal() {
    if (isSavingPayment) return;
    setPayingPurchase(null);
    setPaymentError("");
    setPaymentAmount("");
    setClearAllBalance(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setNotice("");
    setIsSaving(true);

    const purchase: PurchaseInput = {
      companyName: form.companyName.trim(),
      place: form.place,
      category: form.category,
      items: form.items.map((item) => ({
        name: item.name.trim(),
        description: item.description.trim(),
        quantity: Number(item.quantity),
        per_price: Number(item.per_price),
      })),
      gstPercent: form.addGst ? Number(form.gstPercent) : 0,
      total_price: grandTotal,
      initialPaidAmount,
      ...(initialPaidAmount > 0 ? { paymentMethod: form.paymentMethod } : {}),
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

  async function handleAddPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!payingPurchase) return;
    setPaymentError("");
    setNotice("");
    setIsSavingPayment(true);

    try {
      const result = await addPurchasePayment(payingPurchase._id, {
        amount: paymentAmountValue,
        method: paymentMethod,
      });
      setPurchases((current) => current.map((purchase) => purchase._id === result.purchase._id ? result.purchase : purchase));
      setPayingPurchase(null);
      setPaymentAmount("");
      setClearAllBalance(false);
      setNotice("Purchase payment recorded successfully.");
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Could not record the purchase payment.");
    } finally {
      setIsSavingPayment(false);
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
      <div className="admin-page-header">
        <div>
          <p className="admin-page-kicker">Stock management</p>
          <h1 className="admin-page-title">Purchasing</h1>
          <p className="admin-page-description">Keep track of stock purchased from your wholesale suppliers.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setNotice("");
            setFormError("");
            setIsModalOpen(true);
          }}
          className="admin-button-primary"
        >
          <FiPlus size={17} /> Enter Purchasing
        </button>
      </div>

      {notice && (
        <p role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </p>
      )}

      <section className="admin-panel overflow-hidden">
        <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4 md:px-6">
          <div>
            <h2 className="admin-panel-title">Purchase history</h2>
            <p className="admin-panel-description">Wholesale stock entries, newest first</p>
          </div>
          <button
            type="button"
            onClick={refreshPurchases}
            disabled={isLoading}
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#e6dfd8] px-3 py-2 text-[11px] font-medium text-[#514952] transition hover:bg-[#faf8f5] disabled:opacity-50 sm:text-xs"
          >
            <FiRefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {loadError ? (
          <div className="border-t border-[#f0ece8] px-6 py-12 text-center">
            <p role="alert" className="text-sm text-red-700">{loadError}</p>
            <button type="button" onClick={refreshPurchases} className="mt-3 text-xs font-semibold text-plum hover:underline">Try again</button>
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
                <p className="mt-2 flex items-center gap-1.5 text-[10px] text-[#928a92]"><FiCalendar size={12} aria-hidden="true" />{formatDate(purchase.purchaseDate || purchase.createdAt)}</p>
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#f0ece8] pt-2.5">
                  <PaymentStatusBadge purchase={purchase} />
                  {getPaymentStatus(purchase) === "pending" && <button type="button" onClick={() => openPaymentModal(purchase)} className="text-[11px] font-semibold text-plum underline-offset-2 hover:underline">Pay now</button>}
                </div>
              </article>
            ))}
          </div>
          <div className="hidden overflow-x-auto border-t border-[#f0ece8] sm:block">
            <table className="admin-table min-w-[780px]">
              <thead className="bg-[#fcfbf9] text-[10px] uppercase tracking-[0.12em] text-[#968d96]">
                <tr>
                  <th className="px-6 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Place</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 text-right font-medium">Total price</th>
                  <th className="px-4 py-3 text-right font-medium">Purchase date</th>
                  <th className="px-5 py-3 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2eeea]">
                {purchases.map((purchase) => (
                  <tr key={purchase._id} className="text-[#554e57]">
                    <td className="px-6 py-4 font-medium text-plum">{purchase.companyName}</td>
                    <td className="px-4 py-4">{purchase.place}</td>
                    <td className="px-4 py-4"><CategoryBadge category={purchase.category} /></td>
                    <td className="px-4 py-4 text-right font-semibold text-[#332a35]">{formatPrice(purchase.total_price)}</td>
                    <td className="px-4 py-4 text-right text-[#817982]">{formatDate(purchase.purchaseDate || purchase.createdAt)}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <PaymentStatusBadge purchase={purchase} />
                        {getPaymentStatus(purchase) === "pending" && <button type="button" onClick={() => openPaymentModal(purchase)} className="rounded-md border border-[#e5d3e2] px-2 py-1.5 text-[10px] font-semibold text-plum hover:bg-[#f7eff6]">Pay now</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </section>

      <section className="admin-panel mt-5 overflow-hidden p-4 sm:mt-6 sm:p-5">
        <div className="mb-5">
          <p className="admin-page-kicker mb-1">Supplier insights</p>
          <h2 className="admin-panel-title">Purchase share by company</h2>
          <p className="admin-panel-description">Each slice shows that company’s share of total purchasing spend.</p>
        </div>
        {isLoading ? (
          <LoadingSpinner label="Loading supplier chart" />
        ) : supplierSpend.length === 0 ? (
          <p className="rounded-xl bg-[#fcfbf9] px-4 py-8 text-center text-xs text-[#928a92]">The supplier pie chart will appear after purchases are recorded.</p>
        ) : (
          <SupplierPieChart suppliers={supplierSpend} onSelect={(name) => setSelectedSupplierKey(name.toLocaleLowerCase())} />
        )}
      </section>

      <PendingSupplierPayments purchases={purchases} isLoading={isLoading} hasError={Boolean(loadError)} />

      {payingPurchase && (
        <div className="admin-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closePaymentModal(); }}>
          <section ref={paymentDialogRef} role="dialog" aria-modal="true" aria-labelledby="purchase-payment-title" className="admin-modal relative p-5 sm:p-6">
            <button type="button" onClick={closePaymentModal} disabled={isSavingPayment} aria-label="Close payment dialog" className="admin-icon-button absolute right-3 top-3 disabled:opacity-50 sm:right-4 sm:top-4"><FiX size={18} /></button>
            <p className="admin-page-kicker mb-1">Purchase payment</p>
            <h2 id="purchase-payment-title" className="pr-10 font-serif text-xl font-medium text-[#2b202c] sm:text-2xl">Pay supplier balance</h2>
            <p className="mt-1 text-sm text-[#817982]">{payingPurchase.companyName}</p>

            <div className="mt-5 grid grid-cols-2 gap-2.5 rounded-xl bg-[#fbfaf8] p-3.5 sm:grid-cols-3">
              <div><p className="text-[10px] text-[#817982]">Total</p><p className="mt-1 text-sm font-semibold text-[#332a35]">{formatPrice(payingPurchase.total_price)}</p></div>
              <div><p className="text-[10px] text-[#817982]">Paid so far</p><p className="mt-1 text-sm font-semibold text-[#356b57]">{formatPrice(getPaidAmount(payingPurchase))}</p></div>
              <div className="col-span-2 sm:col-span-1"><p className="text-[10px] text-[#817982]">Remaining</p><p className="mt-1 text-sm font-semibold text-[#8a682e]">{formatPrice(currentPaymentRemaining)}</p></div>
            </div>

            {payingPurchase.payments?.length ? (
              <div className="mt-4 rounded-xl border border-[#eee8e2] px-3.5 py-3">
                <h3 className="text-xs font-semibold text-[#514852]">Payment history</h3>
                <ul className="mt-2 max-h-28 space-y-2 overflow-y-auto">
                  {payingPurchase.payments.map((payment, index) => (
                    <li key={payment._id ?? `${payment.paidAt}-${index}`} className="flex items-center justify-between gap-3 text-[11px]">
                      <span className="text-[#817982]">{paymentMethodLabel(payment.method)} · {formatDate(payment.paidAt)}</span>
                      <span className="font-medium text-[#332a35]">{formatPrice(payment.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-4 rounded-xl border border-[#eee8e2] px-3.5 py-3 text-[11px] text-[#817982]">No payments have been recorded for this purchase.</p>
            )}

            <form onSubmit={handleAddPayment} className="mt-5 space-y-4">
              <div>
                <label htmlFor="purchase-payment-amount" className="admin-field-label">Payment amount</label>
                <input id="purchase-payment-amount" type="number" required min="1" max={currentPaymentRemaining} step="1" value={paymentAmount} disabled={clearAllBalance} onChange={(event) => setPaymentAmount(event.target.value)} className="admin-field" placeholder="Enter amount" />
              </div>
              <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-[#e8e2dc] px-3 py-2.5 text-xs text-[#514852]">
                <input type="checkbox" checked={clearAllBalance} onChange={(event) => { const checked = event.target.checked; setClearAllBalance(checked); setPaymentAmount(checked ? String(currentPaymentRemaining) : ""); }} className="mt-0.5 h-4 w-4 accent-[#401d3c]" />
                <span><strong className="font-semibold">Clear all remaining balance</strong><span className="mt-0.5 block text-[10px] text-[#817982]">Pay {formatPrice(currentPaymentRemaining)} and mark this purchase paid.</span></span>
              </label>
              <div>
                <label htmlFor="purchase-payment-method-now" className="admin-field-label">Pay via</label>
                <select id="purchase-payment-method-now" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PurchasePaymentMethod)} className="admin-field">
                  <option value="cash">Cash</option>
                  <option value="online">Online / UPI</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              <p className="flex justify-between rounded-lg bg-[#f8f5f1] px-3 py-2.5 text-xs"><span className="text-[#716a73]">Balance after this payment</span><strong className="text-[#332a35]">{formatPrice(remainingAfterPayment)}</strong></p>
              {paymentError && <p role="alert" className="rounded-lg border border-[#f0d8d6] bg-[#fff6f5] px-3 py-2.5 text-xs text-[#a13d39]">{paymentError}</p>}
              <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                <button type="button" onClick={closePaymentModal} disabled={isSavingPayment} className="admin-button-secondary">Cancel</button>
                <button type="submit" disabled={isSavingPayment || paymentAmountValue < 1 || paymentAmountValue > currentPaymentRemaining} className="admin-button-primary">
                  {isSavingPayment && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
                  {isSavingPayment ? "Saving payment…" : "Submit payment"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {isModalOpen && (
        <div
          className="admin-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="purchase-modal-title" className="admin-modal relative p-5 sm:p-6">
            <button type="button" onClick={closeModal} disabled={isSaving} aria-label="Close purchasing form" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-[#7c737d] transition hover:bg-[#f3eef2] hover:text-plum disabled:opacity-50">
              <FiX size={18} />
            </button>

            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a07848]">Wholesale stock</p>
            <h2 id="purchase-modal-title" className="mt-2 font-serif text-xl font-medium text-[#2b202c] sm:text-2xl">Enter a purchase</h2>
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

              <section aria-labelledby="purchase-items-title" className="rounded-xl border border-[#ece6df] bg-[#fcfbf9] p-3.5 sm:p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 id="purchase-items-title" className="text-xs font-semibold text-[#514852]">Purchase items</h3>
                    <p className="mt-0.5 text-[10px] text-[#928a92]">Add one or more items in this category.</p>
                  </div>
                  <button type="button" onClick={() => setForm({ ...form, items: [...form.items, createEmptyItem(crypto.randomUUID())] })} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#e5d3e2] bg-white px-2.5 py-2 text-[10px] font-semibold text-plum transition hover:bg-[#f7eff6]">
                    <FiPlus size={13} /> Add row
                  </button>
                </div>

                <div className="space-y-3">
                  {form.items.map((item, index) => {
                    const rowTotal = roundMoney((Number(item.quantity) || 0) * (Number(item.per_price) || 0));
                    return (
                      <article key={item.id} className="rounded-xl border border-[#ece6df] bg-white p-3 sm:p-3.5">
                        <div className="mb-2.5 flex items-center justify-between">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#a07848]">Item {index + 1}</p>
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, items: form.items.filter((current) => current.id !== item.id) })}
                            disabled={form.items.length === 1}
                            aria-label={`Remove item ${index + 1}`}
                            className="grid h-7 w-7 place-items-center rounded-lg text-[#9d7775] transition hover:bg-[#fff2f0] hover:text-[#a54a4a] disabled:cursor-not-allowed disabled:opacity-35"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <div className="col-span-2 sm:col-span-2">
                            <label htmlFor={`purchase-item-name-${item.id}`} className="mb-1 block text-[10px] font-medium text-[#625a63]">Name <span className="text-red-600">*</span></label>
                            <input id={`purchase-item-name-${item.id}`} required maxLength={120} value={item.name} onChange={(event) => setForm({ ...form, items: form.items.map((current) => current.id === item.id ? { ...current, name: event.target.value } : current) })} placeholder="Item name" className={`${fieldClassName} py-2.5 text-xs`} />
                          </div>
                          <div>
                            <label htmlFor={`purchase-item-quantity-${item.id}`} className="mb-1 block text-[10px] font-medium text-[#625a63]">Quantity <span className="text-red-600">*</span></label>
                            <input id={`purchase-item-quantity-${item.id}`} type="number" required min="1" step="1" value={item.quantity} onChange={(event) => setForm({ ...form, items: form.items.map((current) => current.id === item.id ? { ...current, quantity: event.target.value } : current) })} className={`${fieldClassName} py-2.5 text-xs`} />
                          </div>
                          <div>
                            <label htmlFor={`purchase-item-price-${item.id}`} className="mb-1 block text-[10px] font-medium text-[#625a63]">Per price (₹) <span className="text-red-600">*</span></label>
                            <input id={`purchase-item-price-${item.id}`} type="number" required min="1" step="1" value={item.per_price} onChange={(event) => setForm({ ...form, items: form.items.map((current) => current.id === item.id ? { ...current, per_price: event.target.value } : current) })} placeholder="0" className={`${fieldClassName} py-2.5 text-xs`} />
                          </div>
                        </div>

                        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <label htmlFor={`purchase-item-description-${item.id}`} className="mb-1 block text-[10px] font-medium text-[#625a63]">Description</label>
                            <input id={`purchase-item-description-${item.id}`} maxLength={500} value={item.description} onChange={(event) => setForm({ ...form, items: form.items.map((current) => current.id === item.id ? { ...current, description: event.target.value } : current) })} placeholder="Optional item details" className={`${fieldClassName} py-2.5 text-xs`} />
                          </div>
                          <div className="shrink-0 rounded-lg bg-[#f7eff6] px-3 py-2 sm:min-w-[125px] sm:text-right">
                            <p className="text-[9px] uppercase tracking-wide text-[#817982]">Row total</p>
                            <p className="mt-0.5 text-xs font-semibold text-plum">{formatPrice(rowTotal)}</p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-xl border border-[#ece6df] bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label htmlFor="purchase-add-gst" className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-[#514852]">
                    <input id="purchase-add-gst" type="checkbox" checked={form.addGst} onChange={(event) => setForm({ ...form, addGst: event.target.checked })} className="h-4 w-4 rounded border-[#d8cbd6] accent-[#492447]" />
                    Add GST
                  </label>
                  {form.addGst && (
                    <div className="relative w-[135px]">
                      <select aria-label="GST percentage" value={form.gstPercent} onChange={(event) => setForm({ ...form, gstPercent: event.target.value })} className={`${fieldClassName} appearance-none py-2.5 pr-9 text-xs`}>
                        {[5, 12, 18, 28].map((rate) => <option key={rate} value={rate}>{rate}% GST</option>)}
                      </select>
                      <FiChevronDown aria-hidden="true" size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#817982]" />
                    </div>
                  )}
                </div>
                <div className="mt-4 space-y-2 border-t border-[#f0ece8] pt-3 text-xs">
                  <div className="flex justify-between gap-3 text-[#817982]"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                  {form.addGst && <div className="flex justify-between gap-3 text-[#817982]"><span>GST ({form.gstPercent}%)</span><span>{formatPrice(gstAmount)}</span></div>}
                  <div className="flex justify-between gap-3 border-t border-[#f0ece8] pt-2 text-sm font-semibold text-[#332a35]"><span>Total purchase cost</span><span>{formatPrice(grandTotal)}</span></div>
                  <div className="grid gap-2 border-t border-[#f0ece8] pt-3 sm:grid-cols-[1fr_145px] sm:items-center">
                    <label htmlFor="purchase-initial-paid" className="text-xs font-semibold text-[#514852]">Admin pays now</label>
                    <input id="purchase-initial-paid" type="number" min="0" max={grandTotal} step="1" value={form.initialPaidAmount} onChange={(event) => setForm({ ...form, initialPaidAmount: event.target.value })} className="admin-field" placeholder="0" />
                  </div>
                  {initialPaidAmount > 0 && (
                    <div className="grid gap-2 sm:grid-cols-[1fr_145px] sm:items-center">
                      <label htmlFor="purchase-payment-method" className="text-xs font-semibold text-[#514852]">Paid via</label>
                      <select id="purchase-payment-method" value={form.paymentMethod} onChange={(event) => setForm({ ...form, paymentMethod: event.target.value as PurchasePaymentMethod })} className="admin-field">
                        <option value="cash">Cash</option>
                        <option value="online">Online / UPI</option>
                        <option value="cheque">Cheque</option>
                      </select>
                    </div>
                  )}
                  <div className="flex justify-between gap-3 rounded-lg bg-[#fbfaf8] px-3 py-2.5 text-xs text-[#625a63]">
                    <span>Remaining balance</span><span className="font-semibold text-[#332a35]">{formatPrice(initialRemainingAmount)}</span>
                  </div>
                </div>
              </section>

              {formError && <p role="alert" className="rounded-lg border border-[#f0d8d6] bg-[#fff6f5] px-3.5 py-3 text-xs text-[#a13d39]">{formError}</p>}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={closeModal} disabled={isSaving} className="admin-button-secondary">Cancel</button>
                <button type="submit" disabled={isSaving} className="admin-button-primary">
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
    <span className={`admin-badge capitalize ${categoryStyle(category)}`}>
      {category}
    </span>
  );
}

function PaymentStatusBadge({ purchase }: { purchase: Purchase }) {
  const status = getPaymentStatus(purchase);
  return (
    <span className={`admin-badge capitalize ${status === "paid" ? "border-[#cfe4dc] bg-[#eef7f3] text-[#356b57]" : "border-[#efdfbc] bg-[#fbf5e8] text-[#8a682e]"}`}>
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${status === "paid" ? "bg-[#4c8c6c]" : "bg-[#b68a3f]"}`} />
      {status}
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
        <h1 className="admin-page-title break-words">{companyName}</h1>
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
          <div className="grid gap-4 border-t border-[#f0ece8] bg-[#fcfbf9] p-3 sm:p-5">
            {purchases.map((purchase) => (
              <article key={purchase._id} className="admin-panel mx-auto w-full max-w-4xl p-4 sm:p-6">
                <div className="flex flex-col gap-3 border-b border-[#f0ece8] pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a07848]">Supplier invoice · #{purchase._id.slice(-8).toUpperCase()}</p>
                    <h3 className="mt-1 break-words font-serif text-xl text-[#332a35] sm:text-2xl">{companyName}</h3>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#817982]">
                      <span className="inline-flex items-center gap-1"><FiCalendar size={12} />{formatDate(purchase.purchaseDate || purchase.createdAt)}</span>
                      <span className="inline-flex items-center gap-1"><FiMapPin size={12} />{purchase.place}</span>
                      <CategoryBadge category={purchase.category} />
                      <PaymentStatusBadge purchase={purchase} />
                    </div>
                  </div>
                  <button type="button" onClick={() => saveInvoiceAsPdf(purchase, companyName)} className="inline-flex w-fit shrink-0 items-center justify-center gap-2 rounded-lg border border-[#dfd1dc] bg-[#fbf6fa] px-3 py-2 text-xs font-semibold text-plum transition hover:bg-[#f5ebf3]">
                    <FiDownload size={14} /> Save as PDF
                  </button>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[480px] text-left text-xs">
                    <thead><tr className="border-b border-[#eee8e2] text-[10px] uppercase tracking-[0.12em] text-[#928a92]"><th className="pb-2 font-medium">Item</th><th className="pb-2 text-right font-medium">Quantity</th><th className="pb-2 text-right font-medium">Per price</th><th className="pb-2 text-right font-medium">Amount</th></tr></thead>
                    <tbody>
                {purchase.items?.length ? (
                    purchase.items.map((item, index) => (
                      <tr key={item._id ?? `${item.name}-${index}`} className="border-b border-[#f3efeb] last:border-0"><td className="py-3 pr-3"><p className="font-semibold text-[#514852]">{item.name}</p>{item.description && <p className="mt-1 text-[10px] text-[#928a92]">{item.description}</p>}</td><td className="py-3 text-right text-[#625a63]">{item.quantity}</td><td className="py-3 text-right text-[#625a63]">{formatPrice(item.per_price)}</td><td className="py-3 text-right font-medium text-[#332a35]">{formatPrice(item.total ?? item.quantity * item.per_price)}</td></tr>
                    ))
                ) : purchase.description ? (
                  <tr><td colSpan={4} className="py-3 text-[#625a63]">{purchase.description}</td></tr>
                ) : <tr><td colSpan={4} className="py-3 text-[#928a92]">Item details were not recorded for this purchase.</td></tr>}
                    </tbody>
                  </table>
                </div>
                <div className="ml-auto mt-4 w-full max-w-xs space-y-2 border-t border-[#eee8e2] pt-3 text-xs">
                  <div className="flex justify-between gap-3 text-[#817982]"><span>Subtotal</span><span>{formatPrice(purchase.subtotal ?? purchase.total_price - (purchase.gstAmount ?? 0))}</span></div>
                  {(purchase.gstPercent ?? 0) > 0 && <div className="flex justify-between gap-3 text-[#817982]"><span>GST ({purchase.gstPercent}%)</span><span>{formatPrice(purchase.gstAmount ?? 0)}</span></div>}
                  <div className="flex justify-between gap-3 border-t border-[#eee8e2] pt-2 text-sm font-semibold text-[#332a35]"><span>Total amount</span><span>{formatPrice(purchase.total_price)}</span></div>
                  <div className="flex justify-between gap-3 text-[#817982]"><span>Paid so far</span><span>{formatPrice(getPaidAmount(purchase))}</span></div>
                  {purchase.payments?.map((payment, index) => <div key={payment._id ?? `${payment.paidAt}-${index}`} className="flex justify-between gap-3 pl-2 text-[10px] text-[#928a92]"><span>{paymentMethodLabel(payment.method)} · {formatDate(payment.paidAt)}</span><span>{formatPrice(payment.amount)}</span></div>)}
                  <div className="flex justify-between gap-3 border-t border-[#eee8e2] pt-2 font-semibold text-[#8a682e]"><span>Remaining balance</span><span>{formatPrice(getRemainingAmount(purchase))}</span></div>
                </div>
                <div className="mt-5 flex justify-end"><div className="rounded-full border-2 border-[#9c5260]/70 px-4 py-2 text-center text-[9px] font-bold leading-4 tracking-[0.13em] text-[#9c5260]">SONI SAREE SHOWROOM<br /><span className="font-normal tracking-normal">AKODA · M/GARH</span></div></div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
