import type { Metadata } from "next";
import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import Cotton from "../../../categories/saree/cotton/Cotton";

export const metadata: Metadata = {
  title: "Cotton Sarees | Soni Saree Showroom",
  description: "Explore elegant cotton sarees crafted for everyday comfort, breathable wear, and timeless ethnic style.",
};

export default function BandhaniPage() {
  return <><Header /><Cotton /><Footer /></>;
}
