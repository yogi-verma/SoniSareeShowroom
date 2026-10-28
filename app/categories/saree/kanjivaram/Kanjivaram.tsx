import SareeCollection, { type SareeProduct } from "../SareeCollection";

const products: SareeProduct[] = [
  {
    id: "kanjivaram-orange-magenta",
    name: "Orange & Magenta Kanchi Pattu",
    fabric: "Kanchipuram silk · Gold zari",
    price: 12999,
    rating: 4.9,
    reviews: 42,
    image:
      "https://pochampallysarees.com/cdn/shop/files/unnamed_a3b0bfe0-0616-4df0-92bc-a566a16d4fb4.jpg?v=1773934466&width=900",
    label: "HANDWOVEN",
  },
  {
    id: "kanjivaram-red-gold",
    name: "Heritage Red & Gold Kanjivaram",
    fabric: "Pure silk · Temple border",
    price: 14999,
    rating: 4.8,
    reviews: 35,
    image:
      "https://newfashionfactory.wordpress.com/wp-content/uploads/2021/07/kanchipuram-silk-saree-online.jpg?w=900",
    label: "WEDDING EDIT",
  },
  {
    id: "kanjivaram-cream-maroon",
    name: "Cream Silk with Maroon Zari",
    fabric: "Kanchipuram silk · Brocade",
    price: 11999,
    rating: 4.8,
    reviews: 27,
    image:
      "https://images.cbazaar.com/images/kanchipuram-zari-cream-silk-saree-with-blouse-for-traditional-women-sadsf7398-u.jpg",
    label: "TIMELESS WEAVE",
  },
  {
    id: "kanjivaram-crimson",
    name: "Crimson Korvai Bridal Silk",
    fabric: "Handloom silk · Korvai work",
    price: 16999,
    rating: 5.0,
    reviews: 19,
    image: "https://rmkv.com/cdn/shop/files/KA76761.webp?v=1726641869",
    label: "BRIDAL PICK",
  },
];

export default function Kanjivaram() {
  return (
    <SareeCollection
      title="Kanjivaram Silk Sarees"
      editTitle="Kanjivaram"
      description="Explore luminous Kanchipuram silks, temple-inspired borders and heirloom handwoven designs for celebrations that stay with you."
      heroImage={products[0].image}
      products={products}
    />
  );
}
