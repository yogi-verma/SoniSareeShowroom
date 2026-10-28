import SareeCollection, { type SareeProduct } from "../SareeCollection";

const products: SareeProduct[] = [
  {
    id: "bandhani-red-georgette",
    name: "Red Tie-Dye Bandhani",
    fabric: "Georgette · Hand-tied dots",
    price: 5499,
    rating: 4.8,
    reviews: 38,
    image:
      "https://kapaaskatha.in/cdn/shop/files/handloom-bandhani-georgette-saree-with-traditional-tie-dye.jpg?v=1769500304&width=900",
    label: "ARTISAN PICK",
  },
  {
    id: "bandhani-magenta-silk",
    name: "Magenta Bandhani Silk",
    fabric: "Silk blend · Zari border",
    price: 6999,
    rating: 4.9,
    reviews: 31,
    image:
      "https://cdn.shopify.com/s/files/1/0728/9470/9991/files/ACA4801.jpg?v=1769663208",
    label: "FESTIVE FAVOURITE",
  },
  {
    id: "bandhani-rani-pink",
    name: "Rani Pink Gaji Silk Bandhej",
    fabric: "Gaji silk · Traditional bandhej",
    price: 7999,
    rating: 4.7,
    reviews: 24,
    image:
      "https://i.etsystatic.com/20954163/r/il/cbe8b0/7952417047/il_570xN.7952417047_816t.jpg",
    label: "HANDCRAFTED",
  },
  {
    id: "bandhani-yellow-red",
    name: "Yellow & Red Bandhani Heritage",
    fabric: "Art silk · Gujarati tie-dye",
    price: 4999,
    rating: 4.8,
    reviews: 22,
    image: "https://pbs.twimg.com/media/GT3BIyRWcAAl6xL.jpg",
    label: "SONI PICK",
  },
];

export default function Bandhani() {
  return (
    <SareeCollection
      title="Bandhani Sarees"
      editTitle="Bandhani"
      description="Celebrate the joyful craft of Gujarat and Rajasthan with vibrant bandhej dots, rich colours and graceful drapes made for festive moments."
      heroImage={products[0].image}
      products={products}
    />
  );
}
