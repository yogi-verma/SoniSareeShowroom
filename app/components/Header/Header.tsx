export default function Header() {
  return (
    <header className="relative z-10 flex h-16 items-center justify-between bg-[#201820] px-[5%] text-white">
      <a href="#home" className="flex items-center gap-2"><span className="text-3xl leading-none text-[#c994bc]">❋</span><span className="font-serif text-base leading-none">SareeAura<small className="mt-1 block font-sans text-[6px] tracking-[1.5px] text-[#d8cad5]">THE ART OF INDIAN ELEGANCE</small></span></a>
      <nav className="hidden items-center gap-6 text-[10px] md:flex"><a href="#home" className="hover:text-[#d2a6c5]">Home</a><a href="#shop" className="hover:text-[#d2a6c5]">Shop⌄</a><a href="#collections" className="hover:text-[#d2a6c5]">Collections⌄</a><a href="#story" className="hover:text-[#d2a6c5]">About</a><a href="#journal" className="hover:text-[#d2a6c5]">Blog</a><a href="#contact" className="hover:text-[#d2a6c5]">Contact</a></nav>
      <div className="hidden items-center gap-4 md:flex"><button aria-label="Search">⌕</button><button aria-label="Wishlist">♡</button><button aria-label="Shopping bag" className="relative">♧<span className="absolute -right-2 -top-1 grid h-3 w-3 place-items-center rounded-full bg-[#a879a2] text-[8px]">2</span></button></div>
      <button className="text-xl md:hidden" aria-label="Open menu">☰</button>
    </header>
  );
}
