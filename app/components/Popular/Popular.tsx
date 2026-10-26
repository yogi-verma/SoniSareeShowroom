import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import BestSellers from "./BestSellers";


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

export default function Popular() {
  return (
    <>
      <section
        id="collections"
        className="relative mx-auto max-w-6xl px-[6%] py-9 md:px-0"
      >
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-[2px] text-[#986d8f]">
              SHOP BY CATEGORY
            </span>
            <h2 className="mt-2 font-serif text-2xl leading-tight">
              Explore Our
              <br className="sm:hidden" /> Collections
            </h2>
          </div>
          <Link
            href="/categories"
            className="group relative inline-flex shrink-0 items-center gap-1 whitespace-nowrap pb-1 text-[12px] font-semibold tracking-wide text-plum transition-colors hover:text-[#805b78] after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-[#805b78] after:transition-transform after:duration-300 after:content-[''] hover:after:origin-left hover:after:scale-x-100 sm:text-[13px] md:text-[12px]"
          >
            View All <span aria-hidden="true" className="text-[8px]"><FaArrowRight /></span>
          </Link>
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
      </section>
      <BestSellers />
    </>
  );
}
