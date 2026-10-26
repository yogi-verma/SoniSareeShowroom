import Header from "./components/Header/Header";
import Hero from "./components/Hero/Hero";
import Popular from "./components/Popular/Popular";
import Trends from "./components/Trends/Trends";
import Footer from "./components/Footer/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <Header />
      <Hero />
      <Popular />
      <Trends />
      <Footer />
    </main>
  );
}
