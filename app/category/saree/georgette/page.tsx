import type { Metadata } from "next";
import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import Georgette from "../../../categories/saree/georgette/Georgette";

export const metadata: Metadata = {
  title: "Georgette Sarees | Soni Saree Showroom",
  description: "Discover beautiful georgette sarees with lightweight fabrics, graceful drapes, and elegant designs for every occasion.",
};

export default function BandhaniPage() {
  return <><Header /><Georgette /><Footer /></>;
}
