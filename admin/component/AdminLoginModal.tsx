"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FiArrowRight, FiEye, FiEyeOff, FiLoader, FiX } from "react-icons/fi";
import { loginAdmin } from "../utils/adminApi";
import { useAccessibleDialog } from "./adminComponents/useAccessibleDialog";

type AdminLoginModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function AdminLoginModal({ open, onClose }: AdminLoginModalProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const isBusy = isSubmitting || isRedirecting;
  const digitRefs = useRef<Array<HTMLInputElement | null>>([]);
  const dialogRef = useAccessibleDialog(open, isBusy, closeModal);

  if (!open) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await loginAdmin(password);
      setPassword("");
      setShowPassword(false);
      setIsRedirecting(true);
      await new Promise((resolve) => window.setTimeout(resolve, 250));
      onClose();
      router.push("/admin/sonisaree");
    } catch (requestError) {
      setIsRedirecting(false);
      setPassword("");
      setShowPassword(false);
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
    setShowPassword(false);
    setError("");
    onClose();
  }

  function updatePasswordDigit(index: number, value: string) {
    const digits = value.replace(/\D/g, "");
    setError("");
    if (!digits) {
      setPassword((current) => current.slice(0, index) + current.slice(index + 1));
      return;
    }

    const nextPassword = `${password.slice(0, index)}${digits}${password.slice(index + digits.length)}`.slice(0, 6);
    setPassword(nextPassword);
    digitRefs.current[Math.min(index + digits.length, 5)]?.focus();
  }

  return (
    <div
      className="admin-modal-backdrop admin-centered-backdrop admin-login-backdrop"
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
        className="admin-modal admin-login-modal relative p-5 sm:p-6"
      >
        <div className="relative">
          <button
            type="button"
            onClick={closeModal}
            disabled={isBusy}
            aria-label="Close admin sign in"
            className="admin-icon-button absolute right-0 top-0 disabled:opacity-50"
          >
            <FiX size={19} aria-hidden="true" />
          </button>

          <div className="mb-5 flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-plum font-serif text-lg text-white" aria-hidden="true">❋</span>
            <div>
              <p className="font-serif text-sm leading-tight text-[#2b202c]">Soni Saree Showroom</p>
              <p className="mt-0.5 text-[10px] text-[#817982]">Admin access</p>
            </div>
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a07848]">Administrator sign in</p>
          <h1 id="admin-modal-title" className="mt-1.5 font-serif text-[24px] font-medium leading-tight text-[#2b202c]">
            Enter your PIN
          </h1>
          <p id="admin-modal-description" className="mt-1 text-xs leading-5 text-[#817982]">
            Enter the six-digit admin password to continue.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="admin-field-label mb-0">Admin password</span>
                <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} className="inline-flex min-h-8 items-center gap-1.5 rounded-md px-2 text-[11px] font-medium text-[#716a73] transition hover:bg-[#f5f1f5] hover:text-plum focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum/40">
                  {showPassword ? <FiEyeOff size={14} aria-hidden="true" /> : <FiEye size={14} aria-hidden="true" />}
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div role="group" aria-label="Six-digit admin password" className="grid grid-cols-6 gap-2">
                {Array.from({ length: 6 }, (_, index) => (
                  <input
                    key={index}
                    ref={(element) => { digitRefs.current[index] = element; }}
                    id={index === 0 ? "header-admin-password" : undefined}
                    name={index === 0 ? "password" : undefined}
                    type={showPassword ? "text" : "password"}
                    inputMode="numeric"
                    autoComplete={index === 0 ? "current-password" : "off"}
                    autoFocus={index === 0}
                    required
                    maxLength={6}
                    value={password[index] ?? ""}
                    onChange={(event) => updatePasswordDigit(index, event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Backspace" && !password[index] && index > 0) {
                        event.preventDefault();
                        setPassword((current) => current.slice(0, index - 1) + current.slice(index));
                        digitRefs.current[index - 1]?.focus();
                      } else if (event.key === "ArrowLeft" && index > 0) {
                        digitRefs.current[index - 1]?.focus();
                      } else if (event.key === "ArrowRight" && index < 5) {
                        digitRefs.current[index + 1]?.focus();
                      }
                    }}
                    aria-label={`Password digit ${index + 1}`}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? "admin-login-error" : undefined}
                    className="aspect-square w-full min-w-0 rounded-lg border border-[var(--admin-border-strong)] bg-white text-center text-lg font-semibold text-[#302833] outline-none transition focus:border-[#9b7294] focus:ring-4 focus:ring-[#401d3c]/10 aria-[invalid=true]:border-[#a13d39]"
                  />
                ))}
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
              disabled={isBusy || password.length !== 6}
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

        </div>
      </section>
    </div>
  );
}
