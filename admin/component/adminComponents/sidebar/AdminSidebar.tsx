"use client";

import Link from "next/link";
import { FiGrid, FiShoppingBag, FiTrendingUp } from "react-icons/fi";

export type AdminSection = "overview" | "sales" | "purchasing";

type AdminSidebarProps = {
  activeSection: AdminSection;
  onSelectSection: (section: AdminSection) => void;
};

const sections = [
  { id: "overview", label: "Overview", icon: FiGrid },
  { id: "sales", label: "Sales", icon: FiTrendingUp },
  { id: "purchasing", label: "Purchasing", icon: FiShoppingBag }
] as const;

export default function AdminSidebar({ activeSection, onSelectSection }: AdminSidebarProps) {
  const sectionLinks = (mobile = false) => (
    <nav aria-label="Admin navigation" className={mobile ? "flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" : "space-y-1"}>
      {sections.map(({ id, label, icon: Icon }) => {
        const isActive = activeSection === id;

        return (
          <button
            key={id}
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => onSelectSection(id)}
            className={mobile
              ? `flex min-h-10 min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-2 py-2 text-[11px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum/40 sm:gap-2 sm:px-3 sm:text-xs ${isActive ? "bg-[#f3ebf2] text-plum" : "text-[#716a73] hover:bg-[#f8f5f8] hover:text-plum"}`
              : `group flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum/40 ${isActive ? "bg-[#f3ebf2] text-plum" : "text-[#716a73] hover:bg-[#faf8f5] hover:text-plum"}`}
          >
            <Icon size={mobile ? 16 : 18} aria-hidden="true" />
            {label}
            {!mobile && isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-gold" />}
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[var(--admin-sidebar-width)] shrink-0 flex-col border-r border-[var(--admin-border)] bg-white px-4 py-5 lg:flex">
        <Link href="/" className="mb-8 flex items-center gap-3 px-1" aria-label="Soni Saree Showroom home">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-plum font-serif text-lg text-white">❋</span>
          <span className="font-serif text-[14px] leading-tight">Soni Saree<small className="mt-1 block font-sans text-[9px] tracking-[0.16em] text-[#89818a]">SHOWROOM</small></span>
        </Link>

        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#928a92]">Workspace</p>
        {sectionLinks()}

        <Link href="/" className="mt-auto inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-xs font-medium text-[#716a73] transition hover:bg-[#faf8f5] hover:text-plum focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum/40">Visit storefront <span aria-hidden="true">↗</span></Link>
      </aside>

      <div className="border-b border-[var(--admin-border)] bg-white px-3 py-2 sm:px-4 lg:hidden">
        {sectionLinks(true)}
      </div>
    </>
  );
}
