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
    <main className="min-h-screen bg-[#f7f5f1] text-[#29232b]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <AdminSidebar activeSection={activeSection} onSelectSection={setActiveSection} />

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#e9e3dc] bg-white/95 px-4 py-3 backdrop-blur sm:px-5 sm:py-3.5 lg:px-8">
            <div className="flex items-center gap-3 lg:hidden">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-plum font-serif text-base text-[#e5c3d6]">❋</span>
              <span className="font-serif text-[13px]">Soni Saree Showroom</span>
            </div>
            <div className="hidden lg:block">
              <p className="text-xs text-[#928a92]">Admin workspace</p>
              <p className="mt-0.5 text-sm font-medium">
                {activeSection === "overview" ? "Your shop at a glance" : activeSection === "sales" ? "Sales performance" : "Purchasing"}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden text-right sm:block">
                <span className="block text-sm font-medium">{adminName}</span>
                <span className="block text-[11px] text-[#928a92]">Store administrator</span>
              </span>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#efe2eb] font-serif text-sm font-semibold text-plum">
                {adminName.slice(0, 1).toUpperCase()}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Log out"
                title="Log out"
                className="grid h-9 w-9 place-items-center rounded-full text-[#777078] transition hover:bg-[#f4edf3] hover:text-plum"
              >
                <FiLogOut size={17} />
              </button>
            </div>
          </header>

          <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
            {activeSection === "overview" ? <Overview adminName={adminName} /> : activeSection === "sales" ? <Sales /> : <Purchasing />}
            <footer className="py-5 text-center text-[10px] text-[#a097a0] sm:py-7 sm:text-[11px]">Soni Saree Showroom · Admin workspace</footer>
          </div>
        </section>
      </div>
    </main>
  );
}
