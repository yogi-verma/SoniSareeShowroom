import type { Metadata } from "next";
import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import Banarshi from "../../../categories/saree/banarshi/Banarshi";

export const metadata: Metadata = {
  title: "Banarshi Silk Sarees | Soni Saree Showroom",
  description: "Shop handpicked Banarshi silk sarees with intricate zari and timeless Varanasi craftsmanship.",
};

export default function BanarshiPage() {
  return <><Header /><Banarshi /><Footer /></>;
}
