"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiAlertCircle, FiLoader, FiLogOut, FiX } from "react-icons/fi";
import AdminSidebar from "./adminComponents/sidebar/AdminSidebar";
import type { AdminSection } from "./adminComponents/sidebar/AdminSidebar";
import Overview from "./adminComponents/sidebarPages/Overview";
import Purchasing from "./adminComponents/sidebarPages/Purchasing";
import Sales from "./adminComponents/sidebarPages/Sales";
import Inventory from "./adminComponents/sidebarPages/inventory";
import { logoutAdmin } from "../utils/adminApi";
import { useAccessibleDialog } from "./adminComponents/useAccessibleDialog";

export default function AdminDashboard({ adminName }: { adminName: string }) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const logoutDialogRef = useAccessibleDialog(isLogoutModalOpen, isLoggingOut, closeLogoutModal);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logoutAdmin();
    } catch {
      // The HttpOnly session cookie cannot be cleared by client-side JavaScript.
    }

    // Clear transient dialog state before navigating so a cached dashboard
    // cannot restore the confirmation in its in-progress state on the next login.
    setIsLogoutModalOpen(false);
    setIsLoggingOut(false);
    await new Promise((resolve) => window.setTimeout(resolve, 50));
    router.replace("/");
  }

  function closeLogoutModal() {
    if (isLoggingOut) return;
    setIsLogoutModalOpen(false);
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
                {activeSection === "overview" ? "Your shop at a glance" : activeSection === "sales" ? "Sales performance" : activeSection === "purchasing" ? "Purchasing" : "Inventory"}
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
                onClick={() => {
                  setIsLoggingOut(false);
                  setIsLogoutModalOpen(true);
                }}
                aria-label="Log out"
                title="Log out"
                className="admin-icon-button"
              >
                <FiLogOut size={17} />
              </button>
            </div>
          </header>

          <div className="admin-page">
            {activeSection === "overview" ? <Overview adminName={adminName} /> : activeSection === "sales" ? <Sales /> : activeSection === "purchasing" ? <Purchasing /> : <Inventory />}
            <footer className="border-t border-[var(--admin-border)] py-4 text-center text-[10px] text-[var(--admin-subtle)] sm:py-5 sm:text-[11px]">Soni Saree Showroom · Admin workspace</footer>
          </div>
        </section>
      </div>
      {isLogoutModalOpen && (
        <div
          className="admin-modal-backdrop admin-centered-backdrop admin-confirm-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeLogoutModal();
          }}
        >
          <section
            role="dialog"
            ref={logoutDialogRef}
            aria-modal="true"
            aria-labelledby="admin-logout-title"
            aria-describedby="admin-logout-description"
            className="admin-modal admin-confirm-modal p-5 sm:p-6"
          >
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#fff5e8] text-[#9a6a24]" aria-hidden="true">
                <FiAlertCircle size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 id="admin-logout-title" className="font-serif text-xl font-medium leading-tight text-[#2b202c]">Log out of admin?</h2>
                <p id="admin-logout-description" className="mt-2 text-sm leading-5 text-[#817982]">Are you sure you want to end your admin session?</p>
              </div>
              <button type="button" onClick={closeLogoutModal} disabled={isLoggingOut} aria-label="Close logout confirmation" className="admin-icon-button -mr-2 -mt-2 disabled:opacity-50">
                <FiX size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={closeLogoutModal} disabled={isLoggingOut} className="admin-button-secondary min-w-24">No, stay</button>
              <button type="button" onClick={handleLogout} disabled={isLoggingOut} className="admin-button-danger min-w-24">
                {isLoggingOut ? <><FiLoader size={15} className="animate-spin" aria-hidden="true" /> Logging out…</> : <><FiLogOut size={15} aria-hidden="true" /> Yes, log out</>}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
