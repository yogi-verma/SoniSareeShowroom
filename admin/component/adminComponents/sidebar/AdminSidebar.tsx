"use client";

import Link from "next/link";
import { FiGrid, FiTrendingUp } from "react-icons/fi";

export type AdminSection = "overview" | "sales" | "purchasing";

type AdminSidebarProps = {
  activeSection: AdminSection;
  onSelectSection: (section: AdminSection) => void;
};

const sections = [
  { id: "overview", label: "Overview", icon: FiGrid },
  { id: "sales", label: "Sales", icon: FiTrendingUp },
  { id: "purchasing", label: "Purchasing", icon: FiTrendingUp }
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
              ? `flex min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-2 py-2 text-[11px] font-medium transition sm:gap-2 sm:rounded-xl sm:px-3 sm:py-2.5 sm:text-xs ${isActive ? "bg-[#f4edf3] text-plum" : "text-[#777078] hover:bg-[#f6f0f5] hover:text-plum"}`
              : `group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${isActive ? "bg-[#f4edf3] text-plum" : "text-[#777078] hover:bg-[#faf8f5] hover:text-plum"}`}
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
      <aside className="hidden w-[250px] shrink-0 flex-col border-r border-[#e9e3dc] bg-white px-5 py-7 lg:flex">
        <Link href="/" className="mb-12 flex items-center gap-3" aria-label="Soni Saree Showroom home">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-plum font-serif text-xl text-[#e5c3d6]">❋</span>
          <span className="font-serif text-[15px] leading-tight">Soni Saree<small className="mt-1 block font-sans text-[9px] tracking-[0.17em] text-[#89818a]">SHOWROOM</small></span>
        </Link>

        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a39aa2]">Workspace</p>
        {sectionLinks()}

        <div className="mt-auto rounded-2xl bg-[#f8f3ed] p-4">
          <p className="font-serif text-base">A little note</p>
          <p className="mt-1.5 text-xs leading-5 text-[#777078]">Your storefront is ready for its next beautiful story.</p>
          <Link href="/" className="mt-3 inline-flex text-xs font-semibold text-plum hover:underline">Visit storefront ↗</Link>
        </div>
      </aside>

      <div className="border-b border-[#e9e3dc] bg-white px-3 py-2.5 sm:px-4 sm:py-3 lg:hidden">
        {sectionLinks(true)}
      </div>
    </>
  );
}
