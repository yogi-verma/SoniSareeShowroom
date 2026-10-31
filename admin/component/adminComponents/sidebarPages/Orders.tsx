"use client";

import { useCallback, useEffect, useState } from "react";
import { FiAlertCircle, FiBox, FiCheckCircle, FiCreditCard, FiLoader, FiMail, FiPhone, FiRefreshCw, FiTruck, FiX } from "react-icons/fi";
import { getAdminOrders, markAdminOrderDelivered } from "../../../utils/adminApi";
import type { AdminOrder, AdminOrdersResponse } from "../../../utils/adminApi";
import { useAccessibleDialog } from "../useAccessibleDialog";

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

function OrderCard({ order, onSelect }: { order: AdminOrder; onSelect: (order: AdminOrder) => void }) {
  const isDelivered = order.deliveryStatus === "delivered";
  return (
    <button type="button" onClick={() => onSelect(order)} className="group flex min-h-[96px] w-full items-center gap-3 rounded-lg border border-[var(--admin-border)] bg-white p-3 text-left transition hover:border-[#c9b5c7] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum/40 sm:p-4">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${isDelivered ? "bg-[#edf4ee] text-[#54745f]" : "bg-[#fff5e8] text-[#9a6a24]"}`}>
        {isDelivered ? <FiCheckCircle size={18} /> : <FiTruck size={18} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-[13px] font-semibold text-[var(--admin-charcoal)]">{order.customerName}</span>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold ${isDelivered ? "bg-[#edf4ee] text-[#54745f]" : "bg-[#fff5e8] text-[#8b642f]"}`}>{isDelivered ? "DELIVERED" : "PENDING"}</span>
        </span>
        <span className="mt-1 block truncate text-[11px] text-[var(--admin-subtle)]">{order.items.map((item) => `${item.name} × ${item.quantity}`).join(" · ")}</span>
        <span className="mt-1 block truncate text-[10px] text-[var(--admin-subtle)]">{order.receipt} · {formatDate(isDelivered ? order.deliveredAt : order.paidAt)}</span>
      </span>
      <span className="shrink-0 text-right">
        <span className="block text-[13px] font-semibold text-[var(--admin-charcoal)]">{formatPrice(order.totalAmount)}</span>
        <span className="mt-1 block text-[10px] font-medium text-plum group-hover:underline">View details</span>
      </span>
    </button>
  );
}

export default function Orders() {
  const [data, setData] = useState<AdminOrdersResponse>({ totalSuccessfullyDelivered: 0, pendingOrders: 0, orders: [], completedOrders: 0, completed: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isConfirmingDelivery, setIsConfirmingDelivery] = useState(false);
  const [isMarkingDelivered, setIsMarkingDelivered] = useState(false);
  const [notice, setNotice] = useState("");

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      setData(await getAdminOrders());
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load customer orders.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadOrders(), 0);
    return () => window.clearTimeout(timer);
  }, [loadOrders]);

  function closeDialog() {
    if (isMarkingDelivered) return;
    setSelectedOrder(null);
    setIsConfirmingDelivery(false);
  }

  const dialogRef = useAccessibleDialog(Boolean(selectedOrder), isMarkingDelivered, closeDialog);

  async function confirmDelivery() {
    if (!selectedOrder) return;
    setIsMarkingDelivered(true);
    setLoadError("");
    try {
      const result = await markAdminOrderDelivered(selectedOrder.id);
      setNotice(result.message || "Order marked delivered.");
      setSelectedOrder(null);
      setIsConfirmingDelivery(false);
      await loadOrders();
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not update this order.");
      setIsConfirmingDelivery(false);
    } finally {
      setIsMarkingDelivered(false);
    }
  }

  return (
    <section aria-labelledby="orders-page-title">
      <div className="admin-page-header">
        <div>
          <p className="admin-page-kicker">Fulfillment</p>
          <h1 id="orders-page-title" className="admin-page-title">Customer Orders</h1>
          <p className="admin-page-description">Review paid orders and track delivery.</p>
        </div>
        <button type="button" onClick={() => void loadOrders()} disabled={isLoading} className="admin-button-secondary"><FiRefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> Refresh</button>
      </div>

      {loadError && <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-[#efd5d3] bg-[#fff7f6] px-4 py-3 text-xs text-[#9b3935]"><FiAlertCircle size={15} className="mt-0.5 shrink-0" /><span>{loadError}</span></div>}
      {notice && <div role="status" className="mb-4 flex items-center gap-2 rounded-xl border border-[#d8e8db] bg-[#f3f8f4] px-4 py-3 text-xs text-[#54745f]"><FiCheckCircle size={15} /><span>{notice}</span><button type="button" aria-label="Dismiss message" onClick={() => setNotice("")} className="ml-auto"><FiX size={14} /></button></div>}

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <article className="flex items-center justify-between gap-3 rounded-xl border border-[var(--admin-border)] bg-white p-4 shadow-sm sm:p-5">
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--admin-subtle)]">Completed deliveries</p><p className="mt-1 font-serif text-2xl text-[var(--admin-charcoal)]">{isLoading ? "—" : data.totalSuccessfullyDelivered}</p></div>
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#edf4ee] text-[#54745f]"><FiCheckCircle size={18} /></span>
        </article>
        <article className="flex items-center justify-between gap-3 rounded-xl border border-[#eadfc7] bg-[#fffdfa] p-4 shadow-sm sm:p-5">
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--admin-subtle)]">Pending deliveries</p><p className="mt-1 font-serif text-2xl text-[#8b642f]">{isLoading ? "—" : data.pendingOrders}</p></div>
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#fff5e8] text-[#9a6a24]"><FiTruck size={18} /></span>
        </article>
      </div>

      <section className="admin-panel mb-5 overflow-hidden">
        <header className="admin-panel-header">
          <div><h2 className="admin-panel-title">Pending deliveries</h2><p className="admin-panel-description">{data.pendingOrders} awaiting confirmation</p></div>
          <FiTruck size={18} className="text-[#9a6a24]" aria-hidden="true" />
        </header>
        {isLoading ? <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">{[0, 1, 2, 3].map((key) => <div key={key} className="h-24 animate-pulse rounded-lg bg-[#f4f0ed]" />)}</div> : data.orders.length ? <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">{data.orders.map((order) => <OrderCard key={order.id} order={order} onSelect={(value) => { setSelectedOrder(value); setIsConfirmingDelivery(false); }} />)}</div> : <p className="px-4 py-8 text-center text-xs text-[var(--admin-subtle)]">No pending deliveries.</p>}
      </section>

      <section className="admin-panel overflow-hidden">
        <header className="admin-panel-header">
          <div><h2 className="admin-panel-title">Completed deliveries</h2><p className="admin-panel-description">{data.completedOrders} successfully delivered</p></div>
          <FiCheckCircle size={18} className="text-[#54745f]" aria-hidden="true" />
        </header>
        {isLoading ? <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">{[0, 1].map((key) => <div key={key} className="h-24 animate-pulse rounded-lg bg-[#f4f0ed]" />)}</div> : data.completed.length ? <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">{data.completed.map((order) => <OrderCard key={order.id} order={order} onSelect={(value) => { setSelectedOrder(value); setIsConfirmingDelivery(false); }} />)}</div> : <p className="px-4 py-8 text-center text-xs text-[var(--admin-subtle)]">Completed deliveries will appear here.</p>}
      </section>

      {selectedOrder && <div className="admin-modal-backdrop admin-centered-backdrop admin-confirm-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDialog(); }}>
        <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="order-detail-title" className="admin-modal relative w-full max-w-xl p-5 sm:p-6">
          <button type="button" onClick={closeDialog} disabled={isMarkingDelivered} aria-label="Close order details" className="admin-icon-button absolute right-3 top-3 disabled:opacity-50"><FiX size={17} /></button>
          {!isConfirmingDelivery ? <>
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--admin-subtle)]">{selectedOrder.deliveryStatus === "delivered" ? "COMPLETED DELIVERY" : "PENDING DELIVERY"}</p>
            <div className="mt-1 flex flex-wrap items-start justify-between gap-2 pr-8"><h2 id="order-detail-title" className="font-serif text-xl text-[var(--admin-charcoal)]">Order details</h2><span className="break-all text-[10px] font-medium text-[var(--admin-subtle)]">{selectedOrder.receipt}</span></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-[#faf8f5] p-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-subtle)]">Customer</p><p className="mt-1 text-[13px] font-semibold text-[var(--admin-charcoal)]">{selectedOrder.customerName}</p><p className="mt-1 flex items-center gap-1.5 break-all text-[11px] text-[var(--admin-muted)]"><FiMail size={12} />{selectedOrder.customerEmail || "—"}</p><p className="mt-1 flex items-center gap-1.5 text-[11px] text-[var(--admin-muted)]"><FiPhone size={12} />{selectedOrder.customerPhone || "—"}</p></div>
              <div className="rounded-lg bg-[#faf8f5] p-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-subtle)]">Payment</p><p className="mt-1 text-[13px] font-semibold text-[var(--admin-charcoal)]">{formatPrice(selectedOrder.totalAmount)}</p><p className="mt-1 flex items-center gap-1.5 text-[11px] capitalize text-[var(--admin-muted)]"><FiCreditCard size={12} />{selectedOrder.paymentMethod}</p><p className="mt-1 text-[11px] text-[var(--admin-muted)]">Paid {formatDate(selectedOrder.paidAt)}</p><p className="mt-1 break-all text-[10px] text-[var(--admin-subtle)]">Payment ID: {selectedOrder.paymentId || "—"}</p></div>
            </div>
            <div className="mt-4"><h3 className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-subtle)]"><FiBox size={14} /> Products ({selectedOrder.items.length})</h3><div className="max-h-48 space-y-2 overflow-y-auto">{selectedOrder.items.map((item) => <div key={item.productId} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--admin-border)] px-4 py-3"><div className="min-w-0"><p className="truncate text-[13px] font-medium text-[var(--admin-charcoal)]">{item.name}</p><p className="mt-1 text-[10px] capitalize text-[var(--admin-subtle)]">{item.productType} · {item.category} · Qty {item.quantity} × {formatPrice(item.unitPrice)}</p></div><p className="shrink-0 text-[13px] font-semibold text-[var(--admin-charcoal)]">{formatPrice(item.lineTotal)}</p></div>)}</div></div>
            <div className="mt-4 rounded-lg border border-[var(--admin-border)] px-4 py-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-subtle)]">Delivery</p>{selectedOrder.deliveryStatus === "delivered" ? <p className="mt-1 text-[13px] text-[#54745f]">Delivered {formatDate(selectedOrder.deliveredAt)}{selectedOrder.deliveredBy ? ` by ${selectedOrder.deliveredBy}` : ""}.</p> : <p className="mt-1 text-[13px] text-[#8b642f]">Pending delivery · customer expected to receive within 10 days.</p>}</div>
            <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={closeDialog} className="admin-button-secondary">Close</button>{selectedOrder.deliveryStatus === "pending" && <button type="button" onClick={() => setIsConfirmingDelivery(true)} className="admin-button-primary"><FiCheckCircle size={14} /> Delivered?</button>}</div>
          </> : <>
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#9a6a24]">DELIVERY CONFIRMATION</p>
            <h2 id="order-detail-title" className="mt-1 pr-8 font-serif text-xl text-[var(--admin-charcoal)]">Confirm successful delivery?</h2>
            <p className="mt-2 text-[13px] leading-5 text-[var(--admin-subtle)]">Are you sure this order was delivered successfully? The customer will see the delivered status in their profile.</p>
            <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setIsConfirmingDelivery(false)} disabled={isMarkingDelivered} className="admin-button-secondary">No</button><button type="button" onClick={() => void confirmDelivery()} disabled={isMarkingDelivered} className="admin-button-primary">{isMarkingDelivered ? <><FiLoader size={14} className="animate-spin" /> Saving…</> : "Yes, delivered"}</button></div>
          </>}
        </section>
      </div>}
    </section>
  );
}
