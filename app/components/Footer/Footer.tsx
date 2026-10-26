const benefits = [
  { icon: "♧", title: "Free Shipping", detail: "On orders above ₹1,000" },
  { icon: "♧", title: "Secure Payments", detail: "100% safe & secure" },
  { icon: "↶", title: "Easy Returns", detail: "Hassle-free within 7 days" },
  { icon: "☏", title: "Dedicated Support", detail: "Here for you, always" },
];

export default function Footer() {
  return (
    <>
      <section className="mx-auto grid max-w-6xl grid-cols-2 gap-x-2 gap-y-5 px-[7%] py-6 md:grid-cols-4">{benefits.map((benefit) => <div key={benefit.title} className="flex items-center gap-2 text-[#70546c]"><span className="text-xl">{benefit.icon}</span><p className="flex flex-col gap-1 text-ink"><strong className="text-[8px] md:text-[9px]">{benefit.title}</strong><span className="text-[7px] text-muted md:text-[8px]">{benefit.detail}</span></p></div>)}</section>
      <footer id="contact" className="bg-[#211821] px-[6%] pb-4 pt-8 text-[#eee] md:px-[max(7%,calc((100vw-1120px)/2))]">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-4 gap-y-6 pb-6 md:grid-cols-[1.4fr_.8fr_.9fr_1.2fr] md:gap-9">
          <div><a href="#home" className="flex items-center gap-2"><span className="text-3xl text-[#c994bc]">❋</span><span className="font-serif text-base">SareeAura<small className="mt-1 block font-sans text-[6px] tracking-[1.5px]">THE ART OF INDIAN ELEGANCE</small></span></a><p className="my-3 text-[8px] leading-relaxed text-[#c2b7c0]">Celebrating the timeless beauty of Indian<br/> ethnic wear. Crafted with love, worn with pride.</p><div className="flex gap-2 text-[10px]"><a href="#instagram" aria-label="Instagram" className="grid h-5 w-5 place-items-center rounded-full border border-[#a998a8]">◎</a><a href="#facebook" aria-label="Facebook" className="grid h-5 w-5 place-items-center rounded-full border border-[#a998a8]">f</a><a href="#pinterest" aria-label="Pinterest" className="grid h-5 w-5 place-items-center rounded-full border border-[#a998a8]">p</a><a href="#youtube" aria-label="YouTube" className="grid h-5 w-5 place-items-center rounded-full border border-[#a998a8]">▶</a></div></div>
          <div className="flex flex-col items-start gap-2 text-[8px] text-[#c5bbc4]"><h3 className="mb-1 text-[9px] font-semibold text-white">Quick Links</h3><a href="#home">Home</a><a href="#shop">Shop</a><a href="#collections">Collections</a><a href="#story">About Us</a><a href="#journal">Blog</a><a href="#contact">Contact</a></div>
          <div className="flex flex-col items-start gap-2 text-[8px] text-[#c5bbc4]"><h3 className="mb-1 text-[9px] font-semibold text-white">Customer Care</h3><a href="#contact">Shipping & Returns</a><a href="#contact">FAQs</a><a href="#contact">Track Your Order</a><a href="#contact">Size Guide</a><a href="#contact">Privacy Policy</a></div>
          <div><h3 className="mb-2 text-[9px] font-semibold text-white">Join Our Newsletter</h3><p className="mb-2 text-[8px] leading-relaxed text-[#c2b7c0]">Be the first to know about new arrivals,<br/> exclusive offers, and more.</p><form className="flex h-8 border border-[#66566a]"><label htmlFor="email" className="sr-only">Your email address</label><input id="email" type="email" placeholder="Your email address" className="min-w-0 flex-1 bg-transparent px-2 text-[8px] outline-none placeholder:text-[#a99da8]"/><button type="button" aria-label="Subscribe" className="w-8 bg-[#754877] text-base">→</button></form></div>
        </div>
        <div className="mx-auto flex max-w-6xl justify-between border-t border-[#493c49] pt-3 text-[7px] text-[#a99da8]"><span>© 2025 SareeAura. All rights reserved.</span><span>Made with ♡ in India</span></div>
      </footer>
    </>
  );
}
