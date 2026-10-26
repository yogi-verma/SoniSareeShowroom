import { FiBookmark, FiSearch } from "react-icons/fi";

const navigation = [
  { label: "Home", href: "#home" },
  { label: "Shop", href: "#shop" },
  { label: "Collections", href: "#collections" },
];

function Navigation({ mobile = false }: { mobile?: boolean }) {
  return (
    <nav
      aria-label="Main navigation"
      className={
        mobile
          ? "flex items-center justify-center gap-8 px-5 py-3 text-[11px] md:hidden"
          : "hidden items-center gap-9 text-[11px] tracking-wide text-white/80 md:flex"
      }
    >
      {navigation.map((item) => (
        <a
          key={item.label}
          href={item.href}
          className="transition-colors hover:text-[#d9b5cf]"
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}

export default function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-50 bg-gradient-to-b from-black/40 via-black/15 to-transparent text-white">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-[5%] py-3.5 md:py-4">
        <a href="#home" aria-label="Soni Saree Showroom home" className="group flex items-center gap-2.5">
          <span className="font-serif text-[30px] leading-none text-[#c994bc] transition-colors group-hover:text-[#e4bfd8]">❋</span>
          <span className="font-serif text-[17px] leading-[1.05] tracking-[0.01em] sm:text-[19px]">
            Soni Saree Showroom
            <small className="mt-1.5 block font-sans text-[6px] font-medium tracking-[0.2em] text-[#d8cad5] sm:text-[7px]">
              THE ART OF INDIAN ELEGANCE
            </small>
          </span>
        </a>

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
        </div>
      </div>
      <Navigation mobile />
    </header>
  );
}
