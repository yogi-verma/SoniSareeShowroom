"use client";

import { useEffect, useRef, useState } from "react";
import { FiBookmark, FiChevronRight, FiLogIn, FiSearch, FiShield, FiUser } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminLoginModal from "../../../admin/component/AdminLoginModal";
import { getLoggedInAdmin } from "../../../admin/utils/adminApi";
import { useAuth } from "../Auth/AuthProvider";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "#shop" },
  { label: "Collections", href: "#collections" },
];

function Navigation({ mobile = false }: { mobile?: boolean }) {
  return (
    <nav
      aria-label="Main navigation"
      className={
        mobile
          ? "flex items-center justify-center gap-9 px-5 py-3 text-[12px] md:hidden"
          : "hidden items-center gap-10 text-[13px] tracking-wide text-white/95 md:flex"
      }
    >
      {navigation.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="group relative py-2 font-medium transition-colors hover:text-[#e8c5dc] after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-[#d9b5cf] after:transition-transform after:duration-300 after:content-[''] hover:after:origin-left hover:after:scale-x-100"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export default function Header() {
  const router = useRouter();
  const { user, isLoading, openSignIn } = useAuth();
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!profileMenuRef.current?.contains(event.target as Node)) setIsProfileMenuOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsProfileMenuOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  async function handleAdminClick() {
    if (isCheckingAdmin) return;
    setIsCheckingAdmin(true);
    try {
      await getLoggedInAdmin();
      router.push("/admin/sonisaree");
    } catch {
      setIsAdminModalOpen(true);
    } finally {
      setIsCheckingAdmin(false);
    }
  }

  function openUserProfile() {
    if (!user) return;
    setIsProfileMenuOpen(false);
    router.push(`/me/${encodeURIComponent(user.email)}`);
  }

  return (
    <header className="absolute inset-x-0 top-0 z-50 bg-gradient-to-b from-black/40 via-black/15 to-transparent text-white">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-[5%] py-3.5 md:py-4">
        <Link href="/" aria-label="Soni Saree Showroom home" className="group flex items-center gap-2.5">
          <span className="font-serif text-[30px] leading-none text-[#c994bc] transition-colors group-hover:text-[#e4bfd8]">❋</span>
          <span className="font-serif text-[17px] leading-[1.05] tracking-[0.01em] sm:text-[19px]">
            Soni Saree Showroom
            <small className="mt-1.5 block font-sans text-[6px] font-medium tracking-[0.2em] text-[#d8cad5] sm:text-[7px]">
              THE ART OF INDIAN ELEGANCE
            </small>
          </span>
        </Link>

        <Navigation />

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            aria-label="Search the collection"
            title="Search"
            className="grid h-10 w-10 place-items-center rounded-full text-white/90 transition hover:bg-white/10 hover:text-white"
          >
            <FiSearch aria-hidden="true" size={18} strokeWidth={1.6} />
          </button>
          <a
            href="#shop"
            aria-label="Add items to your wishlist"
            title="Wishlist"
            className="flex h-10 items-center gap-2 rounded-full border border-white/20 px-3 text-white/90 transition hover:border-[#c994bc] hover:bg-white/5 hover:text-white"
          >
            <FiBookmark aria-hidden="true" size={17} strokeWidth={1.6} />
            <span className="hidden text-[10px] tracking-wide sm:inline">Wishlist</span>
          </a>

          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              aria-label={user ? `Account for ${user.name}` : "Open account menu"}
              aria-expanded={isProfileMenuOpen}
              aria-controls="account-menu"
              title="Account"
              onClick={() => setIsProfileMenuOpen((open) => !open)}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/25 text-white/95 transition hover:border-[#c994bc] hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8c5dc]"
            >
              {user?.picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.picture} alt="" className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <FiUser aria-hidden="true" size={18} strokeWidth={1.7} />
              )}
            </button>

            {isProfileMenuOpen && (
              <section
                id="account-menu"
                aria-label="Account menu"
                className="absolute right-0 top-[calc(100%+12px)] z-[60] w-[min(340px,calc(100vw-28px))] overflow-hidden rounded-xl border border-[#eadfd8] bg-[#fffdfa] text-[#302531] shadow-[0_20px_60px_rgba(22,13,22,0.28)]"
              >
                <div className="bg-gradient-to-br from-[#40233e] via-[#30172f] to-[#211821] px-5 pb-5 pt-5 text-white">
                  {/* <span className="grid h-9 w-9 place-items-center rounded-lg border border-white/20 bg-white/10 font-serif text-xl text-[#e4bfd8]" aria-hidden="true">❋</span> */}
                  {isLoading ? (
                    <div className="mt-4 space-y-2" aria-label="Loading account" aria-busy="true">
                      <div className="h-4 w-36 animate-pulse rounded bg-white/20" />
                      <div className="h-3 w-52 animate-pulse rounded bg-white/10" />
                    </div>
                  ) : user ? (
                    <>
                      <p className="text-[9px] font-semibold tracking-[0.22em] text-[#e4bfd8]">WELCOME BACK</p>
                      <p className="mt-1 truncate font-serif text-xl">{user.name}</p>
                      <p className="mt-0.5 truncate text-xs text-white/65">{user.email}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-[9px] font-semibold tracking-[0.22em] text-[#e4bfd8]">YOUR ACCOUNT</p>
                      <p className="mt-1 font-serif text-xl">Welcome to Soni</p>
                      <p className="mt-1 text-xs leading-5 text-white/70">Sign in to make your shopping experience yours.</p>
                    </>
                  )}
                </div>

                <div className="space-y-2 p-3">
                  {isLoading ? (
                    <p className="px-3 py-2 text-xs text-[#777078]">Checking your account…</p>
                  ) : user ? (
                    <>
                      <button
                        type="button"
                        onClick={openUserProfile}
                        className="group flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-left transition hover:bg-[#f6eef4] focus-visible:outline-2 focus-visible:outline-[#986d8f]"
                      >
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-[#f3eaf1] text-[#684768]"><FiUser size={17} /></span>
                        <span className="flex-1">
                          <span className="block text-sm font-semibold">Profile</span>
                          <span className="mt-0.5 block text-[10px] text-[#817681]">Personal details and account</span>
                        </span>
                        <FiChevronRight className="text-[#9b8c9a] transition group-hover:translate-x-0.5" size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          void handleAdminClick();
                        }}
                        className="group flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-left transition hover:bg-[#f6eef4] focus-visible:outline-2 focus-visible:outline-[#986d8f]"
                      >
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-[#f7f2eb] text-[#85683f]"><FiShield size={16} /></span>
                        <span className="flex-1">
                          <span className="block text-sm font-semibold">Admin</span>
                          <span className="mt-0.5 block text-[10px] text-[#817681]">Showroom management</span>
                        </span>
                        <FiChevronRight className="text-[#9b8c9a] transition group-hover:translate-x-0.5" size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          openSignIn();
                        }}
                        className="group flex min-h-12 w-full items-center gap-3 rounded-lg bg-[#30172f] px-3 text-left text-white transition hover:bg-[#593153] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#986d8f]"
                      >
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10"><FiLogIn size={17} /></span>
                        <span className="flex-1">
                          <span className="block text-sm font-semibold">Login / Sign up</span>
                          <span className="mt-0.5 block text-[10px] text-white/65">Continue securely with Google</span>
                        </span>
                        <FiChevronRight className="text-white/65 transition group-hover:translate-x-0.5" size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          void handleAdminClick();
                        }}
                        className="group flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-left transition hover:bg-[#f6eef4] focus-visible:outline-2 focus-visible:outline-[#986d8f]"
                      >
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-[#f7f2eb] text-[#85683f]"><FiShield size={16} /></span>
                        <span className="flex-1">
                          <span className="block text-sm font-semibold">Admin</span>
                          <span className="mt-0.5 block text-[10px] text-[#817681]">Showroom management</span>
                        </span>
                        <FiChevronRight className="text-[#9b8c9a] transition group-hover:translate-x-0.5" size={16} />
                      </button>
                    </>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
      <Navigation mobile />
      {isAdminModalOpen && (
        <AdminLoginModal open onClose={() => setIsAdminModalOpen(false)} />
      )}
    </header>
  );
}
