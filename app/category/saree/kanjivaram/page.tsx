import type { Metadata } from "next";
import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import Kanjivaram from "../../../categories/saree/kanjivaram/Kanjivaram";

export const metadata: Metadata = {
  title: "Kanjivaram Silk Sarees | Soni Saree Showroom",
  description: "Shop exquisite Kanjivaram silk sarees featuring rich silk, intricate zari work, and the timeless weaving heritage of South India.",
};

export default function KanjivaramPage() {
  return <><Header /><Kanjivaram /><Footer /></>;
}
