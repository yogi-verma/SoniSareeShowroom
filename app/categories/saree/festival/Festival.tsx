import SareeCollection, { type SareeProduct } from "../SareeCollection";

const products: SareeProduct[] = [
  {
    id: "festival-red-embroidered",
    name: "Red Silk Festival Embroidery",
    fabric: "Silk blend · Zari embroidery",
    price: 7499,
    rating: 4.9,
    reviews: 41,
    image: "https://sudathi.com/cdn/shop/files/4848S801_1.jpg?v=1762517353",
    label: "FESTIVE FAVOURITE",
  },
  {
    id: "festival-green-diwali",
    name: "Emerald Diwali Celebration",
    fabric: "Silk blend · Floral embroidery",
    price: 8999,
    rating: 4.8,
    reviews: 28,
    image:
      "https://cdn.shopify.com/s/files/1/0672/6058/0012/files/DIWALI-11_1.webp?v=1759575293",
    label: "CELEBRATION EDIT",
  },
  {
    id: "festival-red-bandhani",
    name: "Moonlit Red Bandhani Silk",
    fabric: "Silk · Traditional bandhani",
    price: 7999,
    rating: 4.9,
    reviews: 32,
    image:
      "https://www.aachho.com/cdn/shop/files/NRN_5170.jpg_5_1400x.jpg?v=1728302877",
    label: "HANDCRAFTED",
  },
  {
    id: "festival-tissue-kanchi",
    name: "Golden Brocade Celebration",
    fabric: "Kanchipuram silk · Brocade",
    price: 12999,
    rating: 4.8,
    reviews: 23,
    image: "https://adiakshoy.com/cdn/shop/files/Model_1_209.jpg?v=1751952573",
    label: "SONI PICK",
  },
];

export default function Festival() {
  return (
    <SareeCollection
      title="Festival Sarees"
      editTitle="Festival"
      description="Dress for every joyful gathering in vivid colours, luminous weaves and occasion-ready details chosen for your festive wardrobe."
      heroImage={products[0].image}
      products={products}
    />
  );
}
