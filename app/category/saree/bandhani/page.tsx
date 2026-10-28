import type { Metadata } from "next";
import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import Bandhani from "../../../categories/saree/bandhani/Bandhani";

export const metadata: Metadata = {
  title: "Bandhani Sarees | Soni Saree Showroom",
  description: "Shop beautiful Bandhani sarees featuring traditional tie-dye patterns, vibrant colors, and authentic Indian craftsmanship.",
};

export default function BandhaniPage() {
  return <><Header /><Bandhani /><Footer /></>;
}
