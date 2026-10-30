"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { FiLogOut, FiX } from "react-icons/fi";
import { useRouter } from "next/navigation";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  picture: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  openSignIn: () => void;
  closeSignIn: () => void;
  requestLogout: () => void;
  signInWithGoogle: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const authApiUrl = (process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:5000").replace(/\/+$/, "");

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="h-[18px] w-[18px]">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" transform="translate(0 4)" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.91 46.98 31.84 46.98 24.55Z" />
      <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.54 2.56 10.78l7.97-6.19Z" transform="translate(0 0)" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.73-6c-2.14 1.44-4.88 2.3-8.17 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
    </svg>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [isLogoutConfirmationOpen, setIsLogoutConfirmationOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${authApiUrl}/api/auth/me`, {
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return (await response.json()) as AuthUser;
      })
      .then((currentUser) => {
        if (!controller.signal.aborted) {
          setUser(currentUser);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setUser(null);
          setIsLoading(false);
        }
      });
    return () => controller.abort();
  }, []);

  const openSignIn = useCallback(() => setIsPromptOpen(true), []);
  const closeSignIn = useCallback(() => setIsPromptOpen(false), []);
  const requestLogout = useCallback(() => setIsLogoutConfirmationOpen(true), []);
  const signInWithGoogle = useCallback(() => {
    // This leaves the Next.js app for the Express OAuth endpoint.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`${authApiUrl}/api/auth/google`);
  }, []);
  const confirmLogout = useCallback(async () => {
    setIsSigningOut(true);
    try {
      await fetch(`${authApiUrl}/api/auth/logout`, { method: "POST", credentials: "include" });
    } catch {
      // Clear local signed-in state even if the backend cannot be reached.
    } finally {
      setUser(null);
      setIsSigningOut(false);
      setIsLogoutConfirmationOpen(false);
      router.replace("/");
    }
  }, [router]);

  const contextValue = useMemo(
    () => ({ user, isLoading, openSignIn, closeSignIn, requestLogout, signInWithGoogle }),
    [user, isLoading, openSignIn, closeSignIn, requestLogout, signInWithGoogle],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
      {isPromptOpen && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-[#211821]/60 px-5 py-8 backdrop-blur-[3px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeSignIn();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="sign-in-title"
            className="relative w-full max-w-[420px] rounded-xl border border-[#eadfd8] bg-[#fffdfa] px-7 py-8 text-center text-[#302531] shadow-2xl sm:px-9 sm:py-10"
          >
            <button
              type="button"
              onClick={closeSignIn}
              aria-label="Close sign in dialog"
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-[#756875] transition hover:bg-[#f3edf1] hover:text-[#30172f]"
            >
              <FiX size={18} />
            </button>
            <span className="font-serif text-3xl text-[#986d8f]" aria-hidden="true">❋</span>
            <p className="mt-3 text-[9px] font-semibold tracking-[0.24em] text-[#986d8f]">SONI SAREE SHOWROOM</p>
            <h2 id="sign-in-title" className="mt-2 font-serif text-[26px]">Sign in or create an account</h2>
            <p className="mx-auto mt-2 max-w-[290px] text-xs leading-5 text-[#777078]">
              Continue with Google to add pieces to your bag and shop with us.
            </p>
            <button
              type="button"
              onClick={signInWithGoogle}
              className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-md border border-[#d9d1d8] bg-white px-4 text-sm font-semibold text-[#302531] shadow-sm transition hover:border-[#bba7b8] hover:bg-[#fffaff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#986d8f]"
            >
              <GoogleMark />
              Continue with Google
            </button>
            <p className="mt-5 text-[10px] leading-4 text-[#8b838b]">Your account keeps your shopping experience connected across visits.</p>
          </section>
        </div>
      )}
      {isLogoutConfirmationOpen && (
        <div className="fixed inset-0 z-[110] grid place-items-center bg-[#211821]/65 px-5 py-8 backdrop-blur-[3px]">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            aria-describedby="logout-description"
            className="w-full max-w-[390px] rounded-xl border border-[#eadfd8] bg-[#fffdfa] px-7 py-7 text-center text-[#302531] shadow-2xl sm:px-8"
          >
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#f3edf1] text-[#684768]" aria-hidden="true">
              <FiLogOut size={20} />
            </span>
            <h2 id="logout-title" className="mt-4 font-serif text-2xl">Log out?</h2>
            <p id="logout-description" className="mt-2 text-sm leading-5 text-[#777078]">Are you sure you want to log out of your account?</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isSigningOut}
                onClick={() => setIsLogoutConfirmationOpen(false)}
                className="min-h-11 rounded-sm border border-[#cbb8c8] text-xs font-semibold text-[#30172f] transition hover:bg-[#f6eef4] disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSigningOut}
                onClick={() => void confirmLogout()}
                className="min-h-11 rounded-sm bg-[#30172f] text-xs font-semibold text-white transition hover:bg-[#593153] disabled:opacity-60"
              >
                {isSigningOut ? "Logging out…" : "Yes, log out"}
              </button>
            </div>
          </section>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider.");
  return context;
}
