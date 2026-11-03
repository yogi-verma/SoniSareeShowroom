"use client";

import { useEffect, useRef } from "react";

export function useStockRefresh(refresh: () => void | Promise<void>, intervalMs = 30_000) {
  const refreshRef = useRef(refresh);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    const minimumHiddenMs = 1_000;
    let hiddenAt: number | null = document.visibilityState === "hidden" ? Date.now() : null;
    let lastRefreshAt = 0;

    const refreshIfVisible = () => {
      if (document.visibilityState !== "visible") return;
      const now = Date.now();
      if (now - lastRefreshAt < minimumHiddenMs) return;
      lastRefreshAt = now;
      void refreshRef.current();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
        return;
      }

      const wasHiddenLongEnough = hiddenAt !== null && Date.now() - hiddenAt >= minimumHiddenMs;
      hiddenAt = null;
      if (wasHiddenLongEnough) refreshIfVisible();
    };
    const timer = window.setInterval(refreshIfVisible, intervalMs);
    window.addEventListener("soni:stock-updated", refreshIfVisible);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("soni:stock-updated", refreshIfVisible);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [intervalMs]);
}
