export default function Hero() {
  return (
    <section id="home" className="relative flex h-[430px] items-center overflow-hidden bg-[#211821] px-[9%] text-white md:h-[490px]">
      <img src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1800&q=85" alt="Model wearing an elegant traditional saree" className="absolute inset-0 h-full w-full object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#1e1412]/80 via-[#1e1412]/45 to-transparent" />
      <div className="relative max-w-lg"><span className="text-[8px] font-bold tracking-[2px] text-[#d9b5cf]">TIMELESS ELEGANCE</span><h1 className="mt-3 font-serif text-4xl leading-[1.04] md:text-5xl">Beautiful Sarees<br/>for Every Story</h1><p className="my-4 text-[10px] leading-6 text-[#eee4e6] md:text-[11px]">From traditional handlooms to modern weaves,<br className="hidden sm:block"/> find the perfect saree for every occasion.</p><a href="#shop" className="inline-flex items-center gap-3 rounded bg-[#6d3d69] px-5 py-3 text-[9px] hover:bg-[#804b7a]">Shop Now <span>→</span></a></div>
      <div className="absolute bottom-5 left-[9%] flex gap-2"><span className="h-1.5 w-1.5 rounded-full bg-white"/><span className="h-1.5 w-1.5 rounded-full bg-white/50"/><span className="h-1.5 w-1.5 rounded-full bg-white/50"/><span className="h-1.5 w-1.5 rounded-full bg-white/50"/></div>
      <div className="absolute bottom-4 right-[7%] flex gap-2"><button aria-label="Previous slide" className="grid h-7 w-7 place-items-center rounded-full border border-white/60 bg-black/20 text-lg">‹</button><button aria-label="Next slide" className="grid h-7 w-7 place-items-center rounded-full border border-white/60 bg-black/20 text-lg">›</button></div>
    </section>
  );
}
