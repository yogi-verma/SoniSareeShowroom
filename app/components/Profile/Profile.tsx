"use client";

import { useRouter } from "next/navigation";
import { FiArrowRight, FiCheckCircle, FiLogIn, FiLogOut, FiMail, FiShield, FiUser } from "react-icons/fi";
import Header from "../Header/Header";
import { type AuthUser, useAuth } from "../Auth/AuthProvider";

function normalizeEmail(email: string) {
  let normalized = email.trim();
  try {
    normalized = decodeURIComponent(normalized);
  } catch {
    // Keep the original value when it contains a malformed escape sequence.
  }
  return normalized.trim().toLowerCase();
}

function Avatar({ user, size = "large" }: { user: AuthUser; size?: "large" | "small" }) {
  const dimensions = size === "large" ? "h-20 w-20 text-3xl" : "h-12 w-12 text-xl";
  return user.picture ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={user.picture} alt="" className={`${dimensions} shrink-0 rounded-full border-4 border-white/70 object-cover shadow-md`} />
  ) : (
    <span className={`${dimensions} grid shrink-0 place-items-center rounded-full border-4 border-white/70 bg-[#eadce8] font-serif text-[#684768] shadow-md`} aria-hidden="true">
      {user.name.charAt(0).toUpperCase()}
    </span>
  );
}

function LoadingProfile() {
  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#302531]">
      <Header />
      <div className="h-[300px] bg-gradient-to-br from-[#40233e] via-[#30172f] to-[#211821]" />
      <section className="mx-auto -mt-16 max-w-5xl px-5 pb-16 sm:px-8">
        <div className="grid animate-pulse gap-5 rounded-2xl border border-[#eadfd8] bg-[#fffdfa] p-6 shadow-xl md:grid-cols-[280px_1fr] md:p-8">
          <div className="h-52 rounded-xl bg-[#eee6e0]" />
          <div className="space-y-4 py-2"><div className="h-5 w-40 rounded bg-[#eee6e0]" /><div className="h-12 rounded bg-[#f3efeb]" /><div className="h-12 rounded bg-[#f3efeb]" /></div>
        </div>
      </section>
    </main>
  );
}

export default function Profile({ email }: { email: string }) {
  const router = useRouter();
  const { user, isLoading, openSignIn, requestLogout } = useAuth();

  if (isLoading) return <LoadingProfile />;

  const isOwnProfile = Boolean(user && normalizeEmail(user.email) === normalizeEmail(email));

  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#302531]">
      <Header />
      <section className="relative overflow-hidden bg-gradient-to-br from-[#40233e] via-[#30172f] to-[#211821] pb-25 pt-25 text-white sm:pb-25 sm:pt-25">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-32 h-[380px] w-[380px] rounded-full border border-white/10" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-5 -top-16 h-[250px] w-[250px] rounded-full border border-white/10" />
        <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
          <span className="text-[9px] font-semibold tracking-[0.28em] text-[#e4bfd8]">SONI SAREE SHOWROOM</span>
          <h1 className="mt-3 font-serif text-4xl sm:text-5xl">Your profile</h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-white/70">Your account details, all in one place. We’re glad you’re here.</p>
        </div>
      </section>

      <section className="relative mx-auto -mt-16 max-w-5xl px-4 pb-16 sm:px-8 sm:pb-20">
        {user && isOwnProfile ? (
          <div className="grid gap-5 md:grid-cols-[300px_1fr]">
            <aside className="rounded-2xl border border-[#eadfd8] bg-[#fffdfa] p-6 shadow-[0_16px_44px_rgba(43,27,38,0.11)] sm:p-7">
              <div className="flex flex-col items-center text-center">
                <Avatar user={user} />
                <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#edf4ee] px-3 py-1 text-[9px] font-semibold tracking-[0.12em] text-[#54745f]">
                  <FiCheckCircle size={12} /> ACCOUNT ACTIVE
                </span>
                <h2 className="mt-3 max-w-full truncate font-serif text-2xl">{user.name}</h2>
                <p className="mt-1 max-w-full truncate text-xs text-[#777078]">{user.email}</p>
              </div>
              <div className="my-6 h-px bg-[#eee7e1]" />
              <div className="flex items-center gap-3 rounded-xl bg-[#f8f3f6] p-3.5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-[#684768]"><FiShield size={16} /></span>
                <div>
                  <p className="text-xs font-semibold">Secure sign-in</p>
                  <p className="mt-0.5 text-[10px] text-[#817681]">Connected with Google</p>
                </div>
              </div>
            </aside>

            <div className="rounded-2xl border border-[#eadfd8] bg-[#fffdfa] p-6 shadow-[0_16px_44px_rgba(43,27,38,0.11)] sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#eee7e1] pb-5">
                <div>
                  <span className="text-[9px] font-semibold tracking-[0.22em] text-[#986d8f]">ACCOUNT INFORMATION</span>
                  <h2 className="mt-1.5 font-serif text-2xl">Personal details</h2>
                  <p className="mt-1 text-xs text-[#817681]">These details come from your Google account.</p>
                </div>
                <span className="rounded-full border border-[#e8dce7] bg-[#fbf7fa] px-3 py-1.5 text-[9px] font-semibold tracking-wide text-[#684768]">CUSTOMER ACCOUNT</span>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-4 rounded-xl border border-[#eee7e1] bg-white p-4 sm:px-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f6eef4] text-[#684768]"><FiUser size={17} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-semibold tracking-[0.15em] text-[#918792]">FULL NAME</p>
                    <p className="mt-1 truncate text-sm font-medium">{user.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border border-[#eee7e1] bg-white p-4 sm:px-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f6eef4] text-[#684768]"><FiMail size={17} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-semibold tracking-[0.15em] text-[#918792]">EMAIL ADDRESS</p>
                    <p className="mt-1 break-all text-sm font-medium">{user.email}</p>
                  </div>
                </div>
              </div>

              <div className="mt-7 flex flex-col justify-between gap-4 rounded-xl bg-[#f8f3f6] p-4 sm:flex-row sm:items-center sm:px-5">
                <div>
                  <p className="text-sm font-semibold">Ready to leave?</p>
                  <p className="mt-1 text-xs text-[#817681]">You can sign back in anytime with Google.</p>
                </div>
                <button
                  type="button"
                  onClick={requestLogout}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-[#cbb8c8] bg-white px-4 text-xs font-semibold text-[#30172f] transition hover:border-[#30172f] hover:bg-[#fdf9fc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#986d8f]"
                >
                  <FiLogOut size={15} /> Log out
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-xl rounded-2xl border border-[#eadfd8] bg-[#fffdfa] px-6 py-10 text-center shadow-[0_16px_44px_rgba(43,27,38,0.11)] sm:px-10">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#f3eaf1] text-[#684768]"><FiShield size={22} /></span>
            <h2 className="mt-4 font-serif text-2xl">{user ? "This profile isn’t yours" : "Sign in to view your profile"}</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#777078]">
              {user ? "For your privacy, you can only view the profile connected to your signed-in account." : "Your profile is available after you sign in with the Google account connected to this email."}
            </p>
            {user ? (
              <button
                type="button"
                onClick={() => router.replace(`/me/${encodeURIComponent(user.email)}`)}
                className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#30172f] px-5 text-xs font-semibold text-white transition hover:bg-[#593153]"
              >
                Open my profile <FiArrowRight size={15} />
              </button>
            ) : (
              <button
                type="button"
                onClick={openSignIn}
                className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#30172f] px-5 text-xs font-semibold text-white transition hover:bg-[#593153]"
              >
                <FiLogIn size={15} /> Login / Sign up
              </button>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
