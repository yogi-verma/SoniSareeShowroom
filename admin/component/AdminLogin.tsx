"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "../utils/adminApi";
import type { AdminAuthResponse } from "../utils/adminApi";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [admin, setAdmin] = useState<AdminAuthResponse["admin"] | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await loginAdmin(password);
      if (result.token) {
        window.sessionStorage.setItem("adminToken", result.token);
      }
      window.sessionStorage.setItem("adminName", result.admin.name);
      setPassword("");
      router.push("/admin/sonisaree");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleLogout() {
    window.sessionStorage.removeItem("adminToken");
    setAdmin(null);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-5 py-12 text-ink">
      <section className="w-full max-w-md rounded-2xl border border-gold/30 bg-white p-8 shadow-xl shadow-plum/10 sm:p-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-gold">SareeAura</p>
        {admin ? (
          <div>
            <h1 className="font-serif text-3xl">Welcome, {admin.name}</h1>
            <p className="mt-3 text-sm text-muted">You are signed in to the admin account.</p>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-8 w-full rounded-lg bg-plum px-4 py-3 text-sm font-medium text-white transition hover:bg-plum/90"
            >
              Log out
            </button>
          </div>
        ) : (
          <>
            <h1 className="font-serif text-3xl">Admin sign in</h1>
            <p className="mt-2 text-sm text-muted">Enter your admin password to continue.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="admin-password" className="mb-2 block text-sm font-medium">
                  Password
                </label>
                <input
                  id="admin-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border border-plum/20 bg-paper/50 px-4 py-3 outline-none transition placeholder:text-muted/70 focus:border-gold focus:ring-2 focus:ring-gold/20"
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
    </main>
  );
}
