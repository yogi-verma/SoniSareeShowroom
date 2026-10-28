"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiArrowDownRight,
  FiArrowUpRight,
  FiBox,
  FiCalendar,
  FiChevronDown,
  FiGrid,
  FiLogOut,
  FiPackage,
  FiShoppingBag,
  FiTrendingUp,
} from "react-icons/fi";
import { logoutAdmin } from "../utils/adminApi";

const sales = [
  { day: "Mon", amount: 42 },
  { day: "Tue", amount: 68 },
  { day: "Wed", amount: 54 },
  { day: "Thu", amount: 82 },
  { day: "Fri", amount: 61 },
  { day: "Sat", amount: 94 },
  { day: "Sun", amount: 74 },
];

const recentOrders = [
  { id: "#SS-2084", customer: "Ananya Mehta", item: "Banarasi Silk Saree", amount: "₹12,500", status: "Delivered" },
  { id: "#SS-2083", customer: "Priya Shah", item: "Kanjivaram Silk Saree", amount: "₹18,900", status: "Processing" },
  { id: "#SS-2082", customer: "Isha Patel", item: "Chiffon Floral Saree", amount: "₹4,200", status: "Shipped" },
  { id: "#SS-2081", customer: "Meera Joshi", item: "Bandhani Georgette Saree", amount: "₹6,750", status: "Processing" },
];

const topProducts = [
  { name: "Banarasi Silk", units: 48, share: 82, color: "bg-plum" },
  { name: "Kanjivaram Silk", units: 36, share: 63, color: "bg-gold" },
  { name: "Bandhani", units: 29, share: 49, color: "bg-[#a56c8f]" },
  { name: "Cotton Sarees", units: 21, share: 35, color: "bg-[#7b8794]" },
];

const metrics = [
  { label: "Total revenue", value: "₹2,48,500", change: "+12.8%", up: true, icon: FiTrendingUp, note: "vs. previous month" },
  { label: "Orders", value: "186", change: "+8.2%", up: true, icon: FiShoppingBag, note: "vs. previous month" },
  { label: "Average order value", value: "₹1,336", change: "+3.4%", up: true, icon: FiBox, note: "vs. previous month" },
  { label: "Pending orders", value: "12", change: "4 need attention", up: false, icon: FiPackage, note: "ready to process" },
];

export default function AdminDashboard({ adminName }: { adminName: string }) {
  const router = useRouter();

  async function handleLogout() {
    try {
      await logoutAdmin();
    } catch {
      // The HttpOnly session cookie cannot be cleared by client-side JavaScript.
    } finally {
      router.replace("/");
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f5f1] text-[#29232b]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[250px] shrink-0 flex-col border-r border-[#e9e3dc] bg-white px-5 py-7 lg:flex">
          <Link href="/" className="mb-12 flex items-center gap-3" aria-label="Soni Saree Showroom home">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-plum font-serif text-xl text-[#e5c3d6]">❋</span>
            <span className="font-serif text-[15px] leading-tight">Soni Saree<small className="mt-1 block font-sans text-[9px] tracking-[0.17em] text-[#89818a]">SHOWROOM</small></span>
          </Link>

          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a39aa2]">Workspace</p>
          <nav aria-label="Admin navigation" className="space-y-1">
            <a href="#overview" className="flex items-center gap-3 rounded-xl bg-[#f4edf3] px-3 py-3 text-sm font-medium text-plum">
              <FiGrid size={17} /> Overview
            </a>
            <a href="#orders" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#777078] transition hover:bg-[#faf8f5] hover:text-plum">
              <FiShoppingBag size={17} /> Orders
            </a>
            <a href="#products" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#777078] transition hover:bg-[#faf8f5] hover:text-plum">
              <FiPackage size={17} /> Products
            </a>
          </nav>

          <div className="mt-auto rounded-2xl bg-[#f8f3ed] p-4">
            <p className="font-serif text-base">A little note</p>
            <p className="mt-1.5 text-xs leading-5 text-[#777078]">Your storefront is ready for its next beautiful story.</p>
            <Link href="/" className="mt-3 inline-flex text-xs font-semibold text-plum hover:underline">Visit storefront ↗</Link>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#e9e3dc] bg-white/90 px-5 py-4 backdrop-blur md:px-8 lg:px-10">
            <div className="flex items-center gap-3 lg:hidden">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-plum font-serif text-lg text-[#e5c3d6]">❋</span>
              <span className="font-serif text-sm">Soni Saree Showroom</span>
            </div>
            <div className="hidden lg:block">
              <p className="text-xs text-[#928a92]">Wednesday, October 28, 2026</p>
              <p className="mt-0.5 text-sm font-medium">Your shop at a glance</p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden text-right sm:block">
                <span className="block text-sm font-medium">{adminName}</span>
                <span className="block text-[11px] text-[#928a92]">Store administrator</span>
              </span>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#efe2eb] font-serif text-sm font-semibold text-plum">
                {adminName.slice(0, 1).toUpperCase()}
              </span>
              <button type="button" onClick={handleLogout} aria-label="Log out" title="Log out" className="grid h-9 w-9 place-items-center rounded-full text-[#777078] transition hover:bg-[#f4edf3] hover:text-plum">
                <FiLogOut size={17} />
              </button>
            </div>
          </header>

          <div id="overview" className="mx-auto max-w-[1440px] px-5 py-7 md:px-8 md:py-9 lg:px-10">
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-gold">Admin overview</p>
                <h1 className="font-serif text-3xl leading-tight sm:text-4xl">Welcome back, {adminName}</h1>
                <p className="mt-2 text-sm text-[#817982]">Here’s what’s happening with your showroom.</p>
              </div>
              <button type="button" className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#e6dfd8] bg-white px-4 py-2.5 text-sm text-[#514952] shadow-sm">
                <FiCalendar size={15} /> This week <FiChevronDown size={14} />
              </button>
            </div>

            <div role="note" className="mb-6 rounded-xl border border-[#eadbc2] bg-[#fbf5e9] px-4 py-3 text-xs leading-5 text-[#765e3d]">
              <strong className="font-semibold">Preview analytics:</strong> these figures are sample data for the dashboard layout. Connect sales and order data to show live shop analytics.
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <article key={metric.label} className="rounded-2xl border border-[#ece6df] bg-white p-5 shadow-[0_4px_18px_rgba(48,23,47,0.035)]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[#817982]">{metric.label}</span>
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f6f0f5] text-plum"><Icon size={17} /></span>
                    </div>
                    <p className="mt-4 font-serif text-[28px] leading-none">{metric.value}</p>
                    <div className="mt-3 flex items-center gap-1.5 text-[11px]">
                      {metric.up ? <FiArrowUpRight className="text-emerald-700" size={14} /> : <FiArrowDownRight className="text-amber-700" size={14} />}
                      <span className={metric.up ? "font-semibold text-emerald-700" : "font-medium text-amber-700"}>{metric.change}</span>
                      <span className="text-[#a097a0]">{metric.note}</span>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.55fr_1fr]">
              <article className="rounded-2xl border border-[#ece6df] bg-white p-5 shadow-[0_4px_18px_rgba(48,23,47,0.035)] md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-xl">Sales overview</h2>
                    <p className="mt-1 text-xs text-[#928a92]">Revenue across the last 7 days</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">+12.8%</span>
                </div>
                <div className="mt-7 flex h-52 items-end gap-2 border-b border-[#eee9e4] px-1 sm:gap-4">
                  {sales.map((point, index) => (
                    <div key={point.day} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                      <div className="flex h-full w-full items-end">
                        <div className={`w-full rounded-t-md ${index === 5 ? "bg-plum" : "bg-[#e6d8e3]"} transition-colors hover:bg-plum/70`} style={{ height: `${point.amount}%` }} title={`${point.day}: sample revenue`} />
                      </div>
                      <span className="pb-2 text-[10px] text-[#9b929b]">{point.day}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between text-[11px] text-[#928a92]">
                  <span>Mon</span><span>Sun</span>
                </div>
              </article>

              <article id="products" className="rounded-2xl border border-[#ece6df] bg-white p-5 shadow-[0_4px_18px_rgba(48,23,47,0.035)] md:p-6">
                <div className="flex items-start justify-between">
                  <div><h2 className="font-serif text-xl">Top categories</h2><p className="mt-1 text-xs text-[#928a92]">Units sold this month</p></div>
                  <FiTrendingUp className="mt-1 text-gold" size={18} />
                </div>
                <div className="mt-7 space-y-5">
                  {topProducts.map((product) => (
                    <div key={product.name}>
                      <div className="mb-2 flex justify-between text-xs"><span className="font-medium">{product.name}</span><span className="text-[#928a92]">{product.units} units</span></div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-[#f0ece8]"><div className={`h-full rounded-full ${product.color}`} style={{ width: `${product.share}%` }} /></div>
                    </div>
                  ))}
                </div>
              </article>
            </div>

            <article id="orders" className="mt-5 overflow-hidden rounded-2xl border border-[#ece6df] bg-white shadow-[0_4px_18px_rgba(48,23,47,0.035)]">
              <div className="flex items-center justify-between px-5 py-5 md:px-6">
                <div><h2 className="font-serif text-xl">Recent orders</h2><p className="mt-1 text-xs text-[#928a92]">A quick look at your latest sales</p></div>
                <button type="button" className="text-xs font-semibold text-plum hover:underline">View all</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[660px] text-left text-xs">
                  <thead className="border-y border-[#f0ece8] bg-[#fcfbf9] text-[10px] uppercase tracking-[0.12em] text-[#968d96]">
                    <tr><th className="px-6 py-3 font-medium">Order</th><th className="px-4 py-3 font-medium">Customer</th><th className="px-4 py-3 font-medium">Item</th><th className="px-4 py-3 font-medium">Amount</th><th className="px-6 py-3 font-medium">Status</th></tr>
                  </thead>
                  <tbody className="divide-y divide-[#f2eeea]">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="text-[#554e57]">
                        <td className="px-6 py-4 font-medium text-plum">{order.id}</td><td className="px-4 py-4">{order.customer}</td><td className="px-4 py-4">{order.item}</td><td className="px-4 py-4 font-medium">{order.amount}</td>
                        <td className="px-6 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${order.status === "Delivered" ? "bg-emerald-50 text-emerald-700" : order.status === "Shipped" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>{order.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-[#f0ece8] px-6 py-3 text-center text-[11px] text-[#a097a0]">Sample orders shown for preview</div>
            </article>

            <footer className="py-7 text-center text-[11px] text-[#a097a0]">Soni Saree Showroom · Admin workspace</footer>
          </div>
        </section>
      </div>
    </main>
  );
}
