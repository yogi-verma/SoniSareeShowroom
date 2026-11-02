"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiClipboard, FiExternalLink, FiGrid, FiMessageCircle, FiPackage, FiShoppingBag, FiTrendingUp, FiUsers, FiX } from "react-icons/fi";

export type AdminSection = "overview" | "sales" | "purchasing" | "inventory" | "orders" | "users" | "chats";

type AdminSidebarProps = {
  activeSection: AdminSection;
  onSelectSection: (section: AdminSection) => void;
};

const sections = [
  { id: "overview", label: "Overview", icon: FiGrid },
  { id: "sales", label: "Sales", icon: FiTrendingUp },
  { id: "purchasing", label: "Purchasing", icon: FiShoppingBag },
  { id: "inventory", label: "Inventory", icon: FiPackage },
  { id: "orders", label: "Orders", icon: FiClipboard },
  { id: "users", label: "Users", icon: FiUsers },
  { id: "chats", label: "Chats", icon: FiMessageCircle }
] as const;

export default function AdminSidebar({ activeSection, onSelectSection }: AdminSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileOpen]);

  function selectSection(section: AdminSection) {
    setMobileOpen(false);
    onSelectSection(section);
  }

  const sectionLinks = (mobile = false) => (
    <nav aria-label="Admin navigation" className="space-y-1">
      {sections.map(({ id, label, icon: Icon }) => {
        const isActive = activeSection === id;
        return (
          <button
            key={id}
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => selectSection(id)}
            className={`group flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum/40 ${isActive ? "bg-[#f3ebf2] text-plum" : "text-[#716a73] hover:bg-[#faf8f5] hover:text-plum"}`}
          >
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
            {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-gold" />}
          </button>
        );
      })}
      {mobile && <Link href="/" onClick={() => setMobileOpen(false)} className="mt-3 flex min-h-11 items-center gap-3 rounded-xl border-t border-[var(--admin-border)] px-3 pt-3 text-sm font-medium text-[#716a73] transition hover:bg-[#faf8f5] hover:text-plum"><FiExternalLink size={18} aria-hidden="true" /><span>Visit storefront</span><span className="ml-auto" aria-hidden="true">↗</span></Link>}
    </nav>
  );

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[var(--admin-sidebar-width)] shrink-0 flex-col border-r border-[var(--admin-border)] bg-white px-4 py-5 lg:flex">
        <div className="mb-8 flex items-center gap-3 px-1" aria-label="Soni Saree Showroom home">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-plum font-serif text-lg text-white">❋</span>
          <span className="font-serif text-[14px] leading-tight">Admin Dashboard</span>
        </div>
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#928a92]">Workspace</p>
        {sectionLinks()}
        <Link href="/" className="mt-auto inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-xs font-medium text-[#716a73] transition hover:bg-[#faf8f5] hover:text-plum focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum/40">Visit storefront <span aria-hidden="true">↗</span></Link>
      </aside>

      <button
        type="button"
        aria-label="Open admin navigation"
        aria-expanded={mobileOpen}
        aria-controls="mobile-admin-navigation"
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-3 z-[60] grid h-10 w-10 place-items-center rounded-xl border border-[var(--admin-border)] bg-white text-plum shadow-sm transition hover:bg-[#f8f5f8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum/40 lg:hidden"
      >
        <span className="flex w-[18px] flex-col gap-[4px]" aria-hidden="true"><i className="h-[2px] w-full rounded bg-current" /><i className="h-[2px] w-full rounded bg-current" /><i className="h-[2px] w-full rounded bg-current" /></span>
      </button>

      {mobileOpen && <div className="fixed inset-0 z-[70] lg:hidden">
        <button type="button" aria-label="Close admin navigation" onClick={() => setMobileOpen(false)} className="absolute inset-0 h-full w-full cursor-default bg-[#201721]/45 backdrop-blur-[2px]" />
        <aside id="mobile-admin-navigation" aria-label="Admin menu" className="absolute inset-y-0 left-0 flex w-[min(84vw,320px)] flex-col border-r border-[var(--admin-border)] bg-white px-4 pb-5 pt-[max(20px,env(safe-area-inset-top))] shadow-2xl">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-plum font-serif text-xl text-white">❋</span>
              <span><span className="block font-serif text-[15px] leading-5 text-[var(--admin-charcoal)]">Soni Saree Showroom</span><span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--admin-subtle)]">Admin workspace</span></span>
            </div>
            <button type="button" aria-label="Close admin navigation" onClick={() => setMobileOpen(false)} className="admin-icon-button"><FiX size={19} /></button>
          </div>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#928a92]">Workspace</p>
          {sectionLinks(true)}
          <p className="mt-auto border-t border-[var(--admin-border)] px-3 pt-4 text-[10px] text-[var(--admin-subtle)]">Soni Saree Showroom · Admin</p>
        </aside>
      </div>}
    </>
  );
}
