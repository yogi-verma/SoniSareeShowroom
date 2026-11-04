import Link from "next/link";
import { FiArrowUpRight, FiGift } from "react-icons/fi";

export default function FirstCoupon() {
  return (
    <section aria-label="A special saving for you" className="mx-auto max-w-6xl px-[5%] py-7 sm:py-9 md:px-0">
      <div className="relative isolate overflow-hidden rounded-[1.6rem] bg-[#30172f] text-white shadow-[0_20px_55px_-32px_rgba(48,23,47,0.65)]">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_10%_0%,rgba(194,160,184,0.24),transparent_40%),radial-gradient(ellipse_at_90%_100%,rgba(186,139,97,0.17),transparent_42%)]" />
        <div aria-hidden="true" className="absolute -right-12 -top-24 -z-10 h-64 w-64 rounded-full border border-white/10 sm:right-[28%] sm:-top-36 sm:h-80 sm:w-80" />
        <div aria-hidden="true" className="absolute -right-4 -top-16 -z-10 h-48 w-48 rounded-full border border-white/[0.07] sm:right-[31%] sm:-top-28 sm:h-64 sm:w-64" />

        <div className="grid items-center gap-6 px-5 py-7 sm:gap-8 sm:px-8 sm:py-9 md:grid-cols-[1fr_auto_0.9fr] md:gap-10 md:px-10 lg:px-12">
          <div className="max-w-lg">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#d5b68f]/35 bg-white/[0.06] px-3 py-1.5 text-[8px] font-semibold tracking-[0.22em] text-[#e7cba9] sm:text-[9px]">
              <FiGift size={12} aria-hidden="true" /> A LITTLE EXTRA, WITH LOVE
            </span>
            <h2 className="mt-4 font-serif text-[2rem] leading-[1.05] tracking-[-0.035em] sm:text-4xl lg:text-[2.65rem]">
              A more beautiful
              <br className="hidden sm:block" />
              find, for less.
            </h2>
            <p className="mt-3 max-w-sm text-[11px] leading-5 text-white/70 sm:text-xs sm:leading-6">
              Take 20% off one piece you love. A thoughtful little saving on your next favourite find.
            </p>
          </div>

          <div className="flex items-center gap-3 md:flex-col md:gap-0 md:text-center">
            <span className="font-serif text-[4.2rem] leading-none tracking-[-0.07em] text-[#e5c29d] sm:text-[5rem]">20<span className="text-[2.2rem] align-top tracking-[-0.04em] sm:text-[2.6rem]">%</span></span>
            <span className="text-[8px] font-semibold tracking-[0.2em] text-white/55 md:mt-1">ON ONE SELECTED PRODUCT</span>
          </div>

          <div className="flex flex-col items-start gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between md:flex-col md:items-stretch md:border-l md:border-t-0 md:pl-8 md:pt-0">
            <div>
              <p className="text-[8px] font-semibold tracking-[0.2em] text-white/55">YOUR COUPON CODE</p>
              <div className="mt-1.5 inline-flex items-center rounded-lg border border-dashed border-[#d5b68f]/60 bg-white/[0.06] px-4 py-2 font-mono text-lg font-semibold tracking-[0.2em] text-[#f3dfc4] sm:text-xl">TRY01</div>
              <p className="mt-2 text-[9px] text-white/55">One use per email · Apply at checkout</p>
            </div>
            <Link href="/categories" className="group inline-flex min-h-10 items-center gap-2 rounded-full bg-[#ead4b7] px-4 text-[10px] font-semibold text-[#30172f] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#30172f]">
              Find your piece <FiArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
