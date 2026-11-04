import Header from "./components/Header/Header";
import Hero from "./components/Hero/Hero";
import Popular from "./components/Popular/Popular";
import Trends from "./components/Trends/Trends";
import Mens from "./components/mens/Mens";
import Footer from "./components/Footer/Footer";
import Uniqueness from "./components/Uniqueness/Uniqueness";
import { LuxuryItems } from "./components/LuxuryItems/LuxuryItems";
import FirstCoupon from "./components/FirstCoupon/FirstCoupon";

export default function Home() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <Header />
      <Hero />
      <Uniqueness />
      <Popular />
      <LuxuryItems />
      <Trends />
      <FirstCoupon />
      <Mens />
      <Footer />
    </main>
  );
}
