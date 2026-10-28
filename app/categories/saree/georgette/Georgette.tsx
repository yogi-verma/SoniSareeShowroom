import SareeCollection, { type SareeProduct } from "../SareeCollection";

const products: SareeProduct[] = [
  {
    id: "georgette-dusty-pink",
    name: "Dusty Pink Abstract Georgette",
    fabric: "Printed georgette · Soft drape",
    price: 3999,
    rating: 4.8,
    reviews: 33,
    image:
      "https://nupurcollection.in/cdn/shop/files/ElegantGeorgetteSareewithVibrantDustyPinkAbstractPrint-TinyPrints9116-CDustyPink1.jpg?v=1729255294&width=900",
    label: "LIGHT & FLOWING",
  },
  {
    id: "georgette-cream-floral",
    name: "Cream Floral Zari Georgette",
    fabric: "Georgette · Woven zari border",
    price: 5999,
    rating: 4.7,
    reviews: 25,
    image:
      "https://nupurcollection.in/cdn/shop/files/FloralDigitalPrintedCreamGeorgetteSareewithZariWovenBordersandGracefulButta-InayaSilk41052Cream1.jpg?v=1736505976&width=900",
    label: "EVENING EDIT",
  },
  {
    id: "georgette-floral-red",
    name: "Scarlet Floral Party Saree",
    fabric: "Georgette · Floral embellishment",
    price: 6499,
    rating: 4.8,
    reviews: 20,
    image:
      "https://diademstore.com/cdn/shop/files/Bright_Red_Floral_Embroidered_Satin_Saree.webp?v=1780482853",
    label: "PARTY PICK",
  },
  {
    id: "georgette-black-batik",
    name: "Black Batik Georgette",
    fabric: "Pure georgette · Batik print",
    price: 4999,
    rating: 4.7,
    reviews: 17,
    image:
      "https://nupurcollection.in/cdn/shop/files/StunningBlackPureGeorgetteSareewithBatikPattern_ZariWovenBorder_andButtaMotifs-InayaSilk41092Black1.jpg?v=1734599340&width=900",
    label: "NEW ARRIVAL",
  },
];

export default function Georgette() {
  return (
    <SareeCollection
      title="Georgette Sarees"
      editTitle="Georgette"
      description="Discover airy georgette sarees with a soft, fluid fall, delicate detailing and effortless styling for day-to-evening occasions."
      heroImage={products[0].image}
      products={products}
    />
  );
}
