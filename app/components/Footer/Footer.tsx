import Link from "next/link";
import { FiArrowUpRight, FiInstagram } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Shop sarees", href: "#shop" },
  { label: "Explore collections", href: "/categories" },
];

export default function Footer() {
  return (
    <footer className="bg-[#211821] text-[#f8f3ed]">
      <div className="mx-auto max-w-6xl px-[5%] pb-8 pt-10 sm:pt-14 md:px-0">
        <div className="grid gap-9 sm:grid-cols-2 md:grid-cols-[1.5fr_.8fr_1fr] md:gap-14">
          <div className="max-w-sm">
            <Link href="/" className="group inline-flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full border border-[#c994bc]/45 text-2xl text-[#d8adcf] transition-colors group-hover:bg-white/5">
                ❋
              </span>
              <span>
                <span className="block font-serif text-xl leading-none tracking-wide sm:text-2xl">
                  Soni Saree Showroom
                </span>
                <span className="mt-1.5 block text-[8px] font-medium tracking-[0.24em] text-[#c9b7c6]">
                  THE ART OF INDIAN ELEGANCE
                </span>
              </span>
            </Link>
            <p className="mt-5 max-w-xs text-xs leading-6 text-[#c6bac5]">
              A celebration of timeless Indian craftsmanship, thoughtful details,
              and the moments that make every drape yours.
            </p>
            <div className="mt-5 flex items-center gap-2.5">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Visit Instagram"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-[#e7dce6] transition hover:border-[#d9aed0] hover:bg-[#d9aed0] hover:text-[#211821]"
              >
                <FiInstagram size={17} aria-hidden="true" />
              </a>
              <a
                href="https://wa.me/?text=Hello%20Soni%20Saree%20Showroom"
                target="_blank"
                rel="noreferrer"
                aria-label="Chat with us on WhatsApp"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-[#e7dce6] transition hover:border-[#d9aed0] hover:bg-[#d9aed0] hover:text-[#211821]"
              >
                <FaWhatsapp size={18} aria-hidden="true" />
              </a>
              <span className="ml-1 text-[10px] tracking-wide text-[#b9a9b7]">
                Follow along & say hello
              </span>
            </div>
          </div>

          <nav aria-label="Footer navigation">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d9aed0]">
              Explore
            </h2>
            <ul className="mt-4 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 text-xs text-[#d1c6d0] transition hover:text-white"
                  >
                    {link.label}
                    <FiArrowUpRight
                      size={12}
                      aria-hidden="true"
                      className="opacity-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d9aed0]">
              Here to help
            </h2>
            <p className="mt-4 max-w-xs text-xs leading-6 text-[#c6bac5]">
              Need help choosing your look? Send us a message and we’ll be happy
              to help you find the right piece.
            </p>
            <a
              href="https://wa.me/?text=Hello%20Soni%20Saree%20Showroom"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-sm border border-[#d9aed0]/55 px-4 text-[10px] font-semibold tracking-[0.12em] text-[#f5eaf3] transition hover:bg-[#d9aed0] hover:text-[#211821]"
            >
              <FaWhatsapp size={15} aria-hidden="true" />
              CHAT ON WHATSAPP
              <FiArrowUpRight size={13} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
