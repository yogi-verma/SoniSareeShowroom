"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FiArrowRight, FiLoader, FiLock, FiShield, FiX } from "react-icons/fi";
import { loginAdmin } from "../utils/adminApi";
import { useAccessibleDialog } from "./adminComponents/useAccessibleDialog";

type AdminLoginModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function AdminLoginModal({ open, onClose }: AdminLoginModalProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const isBusy = isSubmitting || isRedirecting;
  const dialogRef = useAccessibleDialog(open, isBusy, closeModal);

  if (!open) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await loginAdmin(password);
      setPassword("");
      setIsRedirecting(true);
      router.push("/admin/sonisaree");
    } catch (requestError) {
      setIsRedirecting(false);
      setPassword("");
      const status = requestError instanceof Error
        ? (requestError as Error & { status?: number }).status
        : undefined;
      setError(status === 401
        ? "Password is incorrect. Please try again."
        : requestError instanceof Error
          ? requestError.message
          : "We couldn’t sign you in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function closeModal() {
    if (isBusy) return;
    setPassword("");
    setError("");
    onClose();
  }

  return (
    <div
      className="admin-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeModal();
      }}
    >
      <section
        role="dialog"
        ref={dialogRef}
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        aria-describedby="admin-modal-description"
        className="admin-modal admin-login-modal relative my-auto grid overflow-hidden md:grid-cols-[0.9fr_1.1fr]"
      >
        <aside className="hidden bg-[var(--admin-maroon)] px-7 py-8 text-white md:flex md:min-h-[420px] md:flex-col md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/15 bg-white/10 font-serif text-2xl text-[#e2bfd6]">❋</span>
              <div>
                <p className="font-serif text-[17px] leading-tight">Soni Saree</p>
                <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.22em] text-white/55">Showroom</p>
              </div>
            </div>

            <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.13em] text-white/75">
              <FiShield size={12} className="text-[#d7b978]" /> Private admin access
            </div>
            <h2 className="mt-5 max-w-xs font-serif text-[30px] leading-[1.15]">
              Your showroom, thoughtfully in hand.
            </h2>
            <p className="mt-4 max-w-xs text-[13px] leading-5 text-white/70">
              Sign in to manage your store and see how every detail is coming together.
            </p>
          </div>

          <div className="mt-8 hidden items-center gap-3 border-t border-white/15 pt-5 text-[11px] text-white/65 md:flex">
            <FiLock size={13} className="text-[#d7b978]" />
            Your session is protected with secure admin access.
          </div>
        </aside>

        <div className="relative px-6 py-8 sm:px-8 sm:py-9 md:flex md:flex-col md:justify-center md:px-10">
          <button
            type="button"
            onClick={closeModal}
            disabled={isBusy}
            aria-label="Close admin sign in"
              className="admin-icon-button absolute right-3 top-3 disabled:opacity-50 sm:right-4 sm:top-4"
          >
            <FiX size={19} aria-hidden="true" />
          </button>

          <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f2eaf0] text-plum md:hidden">
            <FiShield size={21} />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a07848]">Administrator sign in</p>
          <h1 id="admin-modal-title" className="mt-3 font-serif text-[28px] font-medium leading-tight text-[#2b202c] sm:text-[32px]">
            Welcome back
          </h1>
          <p id="admin-modal-description" className="mt-2 max-w-sm text-sm leading-6 text-[#817982]">
            Enter your password to continue to the showroom dashboard.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="header-admin-password" className="admin-field-label">
                Admin password
              </label>
              <div className="group flex min-h-10 items-center gap-3 rounded-lg border border-[var(--admin-border-strong)] bg-white px-3 transition focus-within:border-[#9b7294] focus-within:ring-4 focus-within:ring-[#401d3c]/10">
                <FiLock size={16} className="shrink-0 text-[#a79ca7] transition group-focus-within:text-plum" aria-hidden="true" />
                <input
                  id="header-admin-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  autoFocus
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-[#302833] outline-none placeholder:text-[#b0a8b0]"
                  placeholder="Enter your password"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "admin-login-error" : undefined}
                />
              </div>
            </div>

            {error && (
              <p id="admin-login-error" role="alert" className="flex items-start gap-2 rounded-xl border border-[#f0d8d6] bg-[#fff6f5] px-4 py-3 text-xs leading-5 text-[#a13d39]">
                <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#f6dfdd] font-bold">!</span>
                <span>{error}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={isBusy}
              className="admin-button-primary group w-full"
            >
              {isBusy ? (
                <>
                  <FiLoader size={16} className="animate-spin" aria-hidden="true" />
                  {isRedirecting ? "Opening your dashboard…" : "Verifying access…"}
                </>
              ) : (
                <>
                  Continue to dashboard
                  <FiArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <p className="mt-7 flex items-center justify-center gap-2 text-[10px] text-[#a39aa3]">
            <FiLock size={12} /> Protected access for showroom administrators
          </p>
        </div>
      </section>
    </div>
  );
}
