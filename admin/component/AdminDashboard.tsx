"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiLogOut } from "react-icons/fi";
import AdminSidebar from "./adminComponents/sidebar/AdminSidebar";
import type { AdminSection } from "./adminComponents/sidebar/AdminSidebar";
import Overview from "./adminComponents/sidebarPages/Overview";
import Purchasing from "./adminComponents/sidebarPages/Purchasing";
import Sales from "./adminComponents/sidebarPages/Sales";
import { logoutAdmin } from "../utils/adminApi";

export default function AdminDashboard({ adminName }: { adminName: string }) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");

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
    <main className="admin-shell">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <AdminSidebar activeSection={activeSection} onSelectSection={setActiveSection} />

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-[var(--admin-z-header)] flex min-h-[var(--admin-header-height)] items-center justify-between border-b border-[var(--admin-border)] bg-white px-4 py-2.5 sm:px-5 lg:px-7">
            <div className="flex items-center gap-3 lg:hidden">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-plum font-serif text-base text-white">❋</span>
              <span className="font-serif text-sm">Soni Saree Showroom</span>
            </div>
            <div className="hidden lg:block">
              <p className="text-[11px] text-[var(--admin-subtle)]">Admin workspace</p>
              <p className="mt-0.5 text-[13px] font-semibold">
                {activeSection === "overview" ? "Your shop at a glance" : activeSection === "sales" ? "Sales performance" : "Purchasing"}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden text-right sm:block">
                <span className="block text-[13px] font-semibold">{adminName}</span>
                <span className="block text-[11px] text-[var(--admin-subtle)]">Store administrator</span>
              </span>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#f3ebf2] font-serif text-sm font-semibold text-plum">
                {adminName.slice(0, 1).toUpperCase()}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Log out"
                title="Log out"
                className="admin-icon-button"
              >
                <FiLogOut size={17} />
              </button>
            </div>
          </header>

          <div className="admin-page">
            {activeSection === "overview" ? <Overview adminName={adminName} /> : activeSection === "sales" ? <Sales /> : <Purchasing />}
            <footer className="border-t border-[var(--admin-border)] py-4 text-center text-[10px] text-[var(--admin-subtle)] sm:py-5 sm:text-[11px]">Soni Saree Showroom · Admin workspace</footer>
          </div>
        </section>
      </div>
    </main>
  );
}
