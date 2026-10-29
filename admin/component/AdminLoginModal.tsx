"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FiArrowRight, FiLoader, FiLock, FiShield, FiX } from "react-icons/fi";
import { loginAdmin } from "../utils/adminApi";

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

  useEffect(() => {
    if (open) return;

    setPassword("");
    setError("");
    setIsSubmitting(false);
    setIsRedirecting(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isBusy) onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isBusy, onClose, open]);

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
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#160d18]/65 px-4 py-6 backdrop-blur-md sm:px-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeModal();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        aria-describedby="admin-modal-description"
        className="relative my-auto grid w-full max-w-[860px] overflow-hidden rounded-[28px] bg-[#fffdfa] shadow-[0_32px_100px_rgba(12,4,15,0.42)] md:grid-cols-[0.9fr_1.1fr]"
      >
        <aside className="relative isolate overflow-hidden bg-gradient-to-br from-[#452343] via-[#30172f] to-[#211221] px-7 py-8 text-white sm:px-10 sm:py-10 md:flex md:min-h-[520px] md:flex-col md:justify-between">
          <div className="pointer-events-none absolute -right-20 -top-16 -z-10 h-64 w-64 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-8 -top-4 -z-10 h-40 w-40 rounded-full border border-[#d6b375]/20" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 -z-10 h-72 w-72 rounded-full bg-[#b79263]/10 blur-3xl" />

          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/15 bg-white/10 font-serif text-2xl text-[#e2bfd6]">❋</span>
              <div>
                <p className="font-serif text-[17px] leading-tight">Soni Saree</p>
                <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.22em] text-white/55">Showroom</p>
              </div>
            </div>

            <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.13em] text-white/75 md:mt-16">
              <FiShield size={12} className="text-[#d7b978]" /> Private admin access
            </div>
            <h2 className="mt-5 max-w-xs font-serif text-3xl leading-[1.13] sm:text-[38px]">
              Your showroom, thoughtfully in hand.
            </h2>
            <p className="mt-4 max-w-xs text-sm leading-6 text-white/65">
              Sign in to manage your store and see how every detail is coming together.
            </p>
          </div>

          <div className="mt-8 hidden items-center gap-3 border-t border-white/10 pt-5 text-[11px] text-white/45 md:flex">
            <FiLock size={13} className="text-[#d7b978]" />
            Your session is protected with secure admin access.
          </div>
        </aside>

        <div className="relative px-7 py-8 sm:px-10 sm:py-12 md:flex md:flex-col md:justify-center md:px-12">
          <button
            type="button"
            onClick={closeModal}
            disabled={isBusy}
            aria-label="Close admin sign in"
            className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full text-[#7c737d] transition hover:bg-[#f3eef2] hover:text-plum disabled:opacity-50 sm:right-6 sm:top-6"
          >
            <FiX size={19} aria-hidden="true" />
          </button>

          <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f2eaf0] text-plum md:hidden">
            <FiShield size={21} />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a07848]">Administrator sign in</p>
          <h1 id="admin-modal-title" className="mt-3 font-serif text-[32px] leading-tight text-[#2b202c] sm:text-[38px]">
            Welcome back
          </h1>
          <p id="admin-modal-description" className="mt-2 max-w-sm text-sm leading-6 text-[#817982]">
            Enter your password to continue to the showroom dashboard.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="header-admin-password" className="mb-2 block text-xs font-semibold text-[#514852]">
                Admin password
              </label>
              <div className="group flex items-center gap-3 rounded-xl border border-[#e6dfe5] bg-white px-4 transition focus-within:border-[#a87c9e] focus-within:ring-4 focus-within:ring-[#a87c9e]/10">
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
                  className="min-w-0 flex-1 bg-transparent py-3.5 text-sm text-[#302833] outline-none placeholder:text-[#b0a8b0]"
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
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-plum px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-plum/15 transition hover:-translate-y-0.5 hover:bg-[#432140] hover:shadow-plum/25 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-65"
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
