"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FiX } from "react-icons/fi";
import { loginAdmin } from "../utils/adminApi";

type AdminLoginModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function AdminLoginModal({ open, onClose }: AdminLoginModalProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [adminName, setAdminName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSubmitting, onClose, open]);

  if (!open) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await loginAdmin(password);
      if (result.token) window.sessionStorage.setItem("adminToken", result.token);
      window.sessionStorage.setItem("adminName", result.admin.name);
      setAdminName(result.admin.name);
      setPassword("");
      onClose();
      router.push("/admin/sonisaree");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    setPassword("");
    setAdminName("");
    setError("");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) handleClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        className="relative w-full max-w-md rounded-2xl border border-gold/30 bg-paper p-7 text-ink shadow-2xl shadow-black/30 sm:p-9"
      >
        <button
          type="button"
          onClick={handleClose}
          disabled={isSubmitting}
          aria-label="Close admin sign in"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-muted transition hover:bg-plum/10 hover:text-plum disabled:opacity-50"
        >
          <FiX size={19} aria-hidden="true" />
        </button>

        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-gold">Soni Saree Showroom</p>
        {adminName ? (
          <>
            <h2 id="admin-modal-title" className="font-serif text-3xl">Welcome, {adminName}!</h2>
            <p className="mt-3 text-sm text-muted">You are signed in to the admin account.</p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-7 w-full rounded-lg bg-plum px-4 py-3 text-sm font-medium text-white transition hover:bg-plum/90"
            >
              Continue
            </button>
          </>
        ) : (
          <>
            <h2 id="admin-modal-title" className="font-serif text-3xl">Welcome back</h2>
            <p className="mt-2 text-sm text-muted">Enter the admin password to continue.</p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label htmlFor="header-admin-password" className="mb-2 block text-sm font-medium">
                  Admin password
                </label>
                <input
                  id="header-admin-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  autoFocus
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border border-plum/20 bg-white px-4 py-3 text-ink outline-none transition placeholder:text-muted/70 focus:border-gold focus:ring-2 focus:ring-gold/20"
                  placeholder="Enter your password"
                />
              </div>

              {error && (
                <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-plum px-4 py-3 text-sm font-medium text-white transition hover:bg-plum/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
