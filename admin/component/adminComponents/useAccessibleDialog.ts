"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

export function useAccessibleDialog(open: boolean, busy: boolean, onClose: () => void) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    const firstControl = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    firstControl?.focus();

    function keepFocusInside(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) {
        closeRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const controls = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", keepFocusInside);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", keepFocusInside);
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [busy, open]);

  return dialogRef;
}
