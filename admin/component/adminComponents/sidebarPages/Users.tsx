"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FiAward, FiMail, FiPhone, FiRefreshCw, FiSearch, FiUsers } from "react-icons/fi";
import { getAdminUsers } from "../../../utils/adminApi";
import type { AdminUser, AdminUsersResponse } from "../../../utils/adminApi";

const emptyData: AdminUsersResponse = { totalUsers: 0, topUsers: [], users: [] };

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export default function Users() {
  const [data, setData] = useState<AdminUsersResponse>(emptyData);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      setData(await getAdminUsers());
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load users.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadUsers(), 0);
    return () => window.clearTimeout(timer);
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return [...data.users]
      .filter((user) => !query || user.name.toLocaleLowerCase().includes(query) || user.email.toLocaleLowerCase().includes(query) || user.phoneNumber.includes(query))
      .sort((first, second) => second.totalOrders - first.totalOrders || first.name.localeCompare(second.name));
  }, [data.users, search]);

  return (
    <section aria-labelledby="admin-users-title">
      <div className="admin-page-header">
        <div>
          <p className="admin-page-kicker">Customer directory</p>
          <h1 id="admin-users-title" className="admin-page-title">Users</h1>
          <p className="admin-page-description">Customer accounts and their paid order history.</p>
        </div>
        <button type="button" onClick={() => void loadUsers()} disabled={isLoading} className="admin-button-secondary"><FiRefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> Refresh</button>
      </div>

      {loadError && <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#efd5d3] bg-[#fff7f6] px-4 py-3 text-xs text-[#9b3935]"><span>{loadError}</span><button type="button" onClick={() => void loadUsers()} className="font-semibold underline underline-offset-2">Try again</button></div>}

      <article className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-[var(--admin-border)] bg-white p-4 shadow-sm sm:p-5">
        <div><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--admin-subtle)]">Total users</p><p className="mt-1 font-serif text-2xl text-[var(--admin-charcoal)]">{isLoading ? "—" : data.totalUsers.toLocaleString("en-IN")}</p><p className="mt-1 text-[11px] text-[var(--admin-muted)]">Registered customer accounts</p></div>
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#f3ebf2] text-plum"><FiUsers size={22} /></span>
      </article>

      <section aria-labelledby="top-users-title" className="mb-5 space-y-3">
        <div><h2 id="top-users-title" className="admin-panel-title">Top 3 customers</h2><p className="admin-panel-description">Ranked by number of successfully paid orders.</p></div>
        {isLoading ? <div className="grid gap-3 sm:grid-cols-3">{[0, 1, 2].map((rank) => <div key={rank} className="h-28 animate-pulse rounded-xl bg-white" />)}</div>
          : data.topUsers.length ? <div className="grid gap-3 sm:grid-cols-3">{data.topUsers.map((user, index) => <TopUserCard key={user.id} user={user} rank={index + 1} />)}</div>
            : <div className="rounded-xl border border-dashed border-[var(--admin-border-strong)] bg-white px-4 py-6 text-center text-xs text-[var(--admin-muted)]">No paid orders yet, so there are no top customers to rank.</div>}
      </section>

      <section aria-labelledby="all-users-title" className="admin-panel overflow-hidden">
        <header className="admin-panel-header flex-wrap">
          <div><h2 id="all-users-title" className="admin-panel-title">All users</h2><p className="admin-panel-description">{isLoading ? "Loading customer accounts…" : `${filteredUsers.length.toLocaleString("en-IN")} users shown`}</p></div>
          <label className="relative block w-full sm:w-64"><span className="sr-only">Search users</span><FiSearch size={14} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-subtle)]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, phone, or email" className="admin-field !h-10 !pl-9 text-xs" /></label>
        </header>
        {isLoading ? <div className="space-y-2 p-4 sm:p-5">{[0, 1, 2, 3].map((row) => <div key={row} className="h-11 animate-pulse rounded-lg bg-[#f5f1f4]" />)}</div>
          : filteredUsers.length ? <div className="overflow-x-auto"><table className="w-full min-w-[840px] border-collapse text-left text-xs"><thead><tr className="bg-[#faf8f5] text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--admin-subtle)]"><th scope="col" className="px-5 py-3">Name</th><th scope="col" className="px-4 py-3">Phone number</th><th scope="col" className="px-4 py-3">Email</th><th scope="col" className="px-4 py-3 text-right">Total orders</th><th scope="col" className="px-5 py-3 text-right">Total purchasing</th></tr></thead><tbody>{filteredUsers.map((user) => <UserRow key={user.id} user={user} />)}</tbody></table></div>
            : <div className="px-5 py-12 text-center"><span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[#f6eef4] text-[#684768]"><FiUsers size={19} /></span><h3 className="mt-3 font-serif text-lg text-[var(--admin-charcoal)]">{data.users.length ? "No matching users" : "No users yet"}</h3><p className="mt-1 text-xs text-[var(--admin-muted)]">{data.users.length ? "Try another name, phone number, or email." : "Customer accounts will appear here after they sign in."}</p></div>}
      </section>
    </section>
  );
}

function TopUserCard({ user, rank }: { user: AdminUser; rank: number }) {
  const medalStyles = ["bg-[#fbf2dc] text-[#94702c]", "bg-[#f1f2f3] text-[#737b84]", "bg-[#f4e8dc] text-[#996a48]"];
  return (
    <article className="flex min-w-0 items-center gap-3 rounded-xl border border-[var(--admin-border)] bg-white p-4 shadow-sm">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${medalStyles[rank - 1]}`}><FiAward size={19} /><span className="sr-only">Rank {rank}</span></span>
      <div className="min-w-0 flex-1"><p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[var(--admin-subtle)]">#{rank} customer</p><h3 className="mt-0.5 truncate text-[13px] font-semibold text-[var(--admin-charcoal)]" title={user.name}>{user.name}</h3><p className="mt-1 truncate text-[10px] text-[var(--admin-muted)]">{user.email}</p></div>
      <span className="shrink-0 text-right"><span className="block font-serif text-2xl text-plum">{user.totalOrders}</span><span className="text-[9px] text-[var(--admin-subtle)]">{user.totalOrders === 1 ? "order" : "orders"}</span></span>
    </article>
  );
}

function UserRow({ user }: { user: AdminUser }) {
  return (
    <tr className="border-t border-[var(--admin-border)] transition hover:bg-[#fffdfa]">
      <th scope="row" className="px-5 py-3.5 text-left font-medium text-[var(--admin-charcoal)]">{user.name || "—"}</th>
      <td className="px-4 py-3.5"><span className="inline-flex items-center gap-1.5 text-[11px] text-[var(--admin-muted)]"><FiPhone size={13} className="shrink-0" />{user.phoneNumber || "Not provided"}</span></td>
      <td className="px-4 py-3.5"><span className="inline-flex items-center gap-1.5 text-[11px] text-[var(--admin-muted)]"><FiMail size={13} className="shrink-0" /><span className="truncate">{user.email}</span></span></td>
      <td className="px-4 py-3.5 text-right"><span className={`inline-flex min-w-8 justify-center rounded-full px-2 py-1 text-[11px] font-semibold ${user.totalOrders ? "bg-[#f3ebf2] text-plum" : "bg-[#f5f3f4] text-[var(--admin-subtle)]"}`}>{user.totalOrders}</span></td>
      <td className="px-5 py-3.5 text-right text-[13px] font-semibold text-[var(--admin-charcoal)]">{formatCurrency(user.totalPurchasing)}</td>
    </tr>
  );
}
