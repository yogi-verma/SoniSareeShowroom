import type { Metadata } from "next";
import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import Festival from "../../../categories/saree/festival/Festival";

export const metadata: Metadata = {
  title: "Festival Sarees | Soni Saree Showroom",
  description: "Shop stunning festival sarees featuring vibrant colors, exquisite designs, and elegant traditional styles for every celebration.",
};

export default function BandhaniPage() {
  return <><Header /><Festival /><Footer /></>;
}
