import SareeCollection, { type SareeProduct } from "../SareeCollection";

const products: SareeProduct[] = [
  {
    id: "cotton-bengal-magenta",
    name: "Bengal Cotton in Magenta & Orange",
    fabric: "Handloom cotton · Bengal weave",
    price: 3299,
    rating: 4.8,
    reviews: 29,
    image:
      "https://goswadeshi.in/cdn/shop/files/gctsgcosaa0298__3_1800x1800.jpg?v=1736936414",
    label: "HANDLOOM",
  },
  {
    id: "cotton-navy-magenta",
    name: "Navy Jacquard with Magenta Border",
    fabric: "Cotton jacquard · Woven pallu",
    price: 3799,
    rating: 4.7,
    reviews: 21,
    image:
      "https://goswadeshi.in/cdn/shop/files/as-238ct2073n_1.jpg?v=1698991177",
    label: "ARTISAN PICK",
  },
  {
    id: "cotton-khadi-blue",
    name: "Neel Blue Khadi Cotton",
    fabric: "Khadi cotton · Woven border",
    price: 2999,
    rating: 4.9,
    reviews: 34,
    image:
      "https://soul-india.in/cdn/shop/files/i4e.jpg?v=1717599735&width=1200",
    label: "BREATHABLE WEAVE",
  },
  {
    id: "cotton-dobby-green",
    name: "Green Dobby with Pink Border",
    fabric: "Pure cotton · Dobby weave",
    price: 3499,
    rating: 4.8,
    reviews: 18,
    image:
      "https://itokri.com/cdn/shop/files/green-chitrika-pure-handloom-dobby-cotton-saree-sarees-218.jpg?crop=center&height=1200&v=1765662586&width=1200",
    label: "EVERYDAY ELEGANCE",
  },
];

export default function Cotton() {
  return (
    <SareeCollection
      title="Cotton Sarees"
      editTitle="Cotton"
      description="Find breathable handloom cottons, easy everyday drapes and beautiful regional weaves made for comfort from morning to evening."
      heroImage={products[0].image}
      products={products}
    />
  );
}
