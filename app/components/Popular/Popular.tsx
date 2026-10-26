const image = (id: string, width = 600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

const categories = [
  {
    name: "Silk Sarees",
    note: "Elegant & timeless",
    image: "photo-1610030469983-98e550d6193c",
  },
  {
    name: "Cotton Sarees",
    note: "Comfort & charm",
    image: "photo-1583391733956-6c78276477e2",
  },
  {
    name: "Georgette Sarees",
    note: "Light & graceful",
    image: "photo-1617627143750-d86bc21e42bb",
  },
  {
    name: "Rajasthani Suits",
    note: "Royal tradition",
    image: "photo-1610030469668-8e9f641aaf3c",
  },
  {
    name: "Party Wear Suits",
    note: "For special moments",
    image: "photo-1609357605129-26f69add5d6e",
  },
  {
    name: "Handloom Sarees",
    note: "Handcrafted beauty",
    image: "photo-1609748340471-14c1fcbad10d",
  },
];

const products = [
  {
    name: "Royal Purple Banarasi Silk Saree",
    price: "₹ 8,499",
    image: "photo-1610030469983-98e550d6193c",
    tag: "BESTSELLER",
  },
  {
    name: "Meenakari Green Silk Saree",
    price: "₹ 6,999",
    image: "photo-1583391733956-6c78276477e2",
    tag: "NEW ARRIVAL",
  },
  {
    name: "Soft Georgette Saree",
    price: "₹ 3,499",
    image: "photo-1617627143750-d86bc21e42bb",
    tag: "BLOUSE INCLUDED",
  },
  {
    name: "Elegant Cotton Saree",
    price: "₹ 2,299",
    image: "photo-1609748340471-14c1fcbad10d",
    tag: "HANDWOVEN",
  },
];

export default function Popular() {
  return (
    <>
      <section
        id="collections"
        className="relative mx-auto max-w-6xl px-[6%] py-9 md:px-0"
      >
        <div className="mb-5 flex items-end justify-between">
          <div>
            <span className="text-[8px] font-bold tracking-[2px] text-[#986d8f]">
              SHOP BY CATEGORY
            </span>
            <h2 className="mt-2 font-serif text-2xl leading-tight">
              Explore Our
              <br className="sm:hidden" /> Collections
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-x-2 gap-y-5 md:grid-cols-6 md:gap-5">
          {categories.map((category) => (
            <a
              href="#shop"
              key={category.name}
              className="flex flex-col items-center text-center"
            >
              <img
                src={image(category.image, 320)}
                alt={category.name}
                className="mb-2 h-[22vw] w-[22vw] rounded-full object-cover transition hover:scale-105 md:h-24 md:w-24"
              />
              <strong className="text-[8px] font-semibold md:text-[9px]">
                {category.name}
              </strong>
              <span className="mt-1 text-[7px] text-muted md:text-[8px]">
                {category.note}
              </span>
            </a>
          ))}
        </div>
        <a
          href="#shop"
          className="absolute right-[6%] top-[92px] text-[8px] font-semibold md:right-0 md:top-[100px] md:text-[9px]"
        >
          View All <span className="ml-1 text-sm">→</span>
        </a>
      </section>
      <section id="shop" className="mx-auto max-w-6xl px-[5%] pb-8 md:px-0">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <span className="text-[8px] font-bold tracking-[2px] text-[#986d8f]">
              BEST SELLERS
            </span>
            <h2 className="mt-2 font-serif text-2xl">Loved by Many</h2>
            <p className="mt-1 text-[8px] leading-relaxed text-muted">
              Our most popular sarees, handpicked
              <br /> just for you.
            </p>
          </div>
          <div className="mb-1 flex gap-2">
            <button
              aria-label="Previous products"
              className="grid h-7 w-7 place-items-center rounded-full border border-[#ddd2d8] text-lg"
            >
              ‹
            </button>
            <button
              aria-label="Next products"
              className="grid h-7 w-7 place-items-center rounded-full border border-[#ddd2d8] text-lg"
            >
              ›
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {products.map((product) => (
            <article key={product.name} className="bg-[#fffaf4] shadow-sm">
              <div className="relative h-[62vw] max-h-[310px] overflow-hidden md:h-[270px]">
                <img
                  src={image(product.image)}
                  alt={product.name}
                  className="h-full w-full object-cover object-center transition duration-300 hover:scale-105"
                />
                <span className="absolute left-2 top-2 bg-[#fffaf0] px-2 py-1 text-[7px] tracking-wide text-[#684768]">
                  {product.tag}
                </span>
                <button
                  aria-label={`Add ${product.name} to wishlist`}
                  className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-[#fffaf0] text-base"
                >
                  ♡
                </button>
              </div>
              <div className="p-2.5">
                <h3 className="min-h-7 font-serif text-xs font-medium">
                  {product.name}
                </h3>
                <div className="mb-1 text-[10px] tracking-widest text-[#ad8952]">
                  ★★★★★{" "}
                  <span className="text-[8px] tracking-normal text-muted">
                    (24)
                  </span>
                </div>
                <strong className="mb-2 block text-[11px]">
                  {product.price}
                </strong>
                <button className="w-full rounded-sm bg-plum py-2 text-[9px] text-white hover:bg-[#593153]">
                  Add to Cart
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
