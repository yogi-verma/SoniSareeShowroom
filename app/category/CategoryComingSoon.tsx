import Link from "next/link";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

type Props = {
  categoryName: string;
  collectionName: string;
};

export default function CategoryComingSoon({ categoryName, collectionName }: Props) {
  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#2d242d]">
      <Header />
      <section className="mx-auto flex min-h-[55vh] max-w-4xl flex-col items-center justify-center px-[6%] py-20 text-center">
        <span className="text-[9px] font-semibold tracking-[0.24em] text-[#986d8f]">
          {collectionName.toUpperCase()}
        </span>
        <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
          {categoryName}
        </h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-[#777078]">
          We will launch {collectionName} for you soon.
        </p>
        <Link
          href="/categories"
          className="mt-8 inline-flex min-h-11 items-center justify-center bg-[#30172f] px-6 text-[10px] font-semibold tracking-[0.12em] text-white transition hover:bg-[#593153]"
        >
          BROWSE CATEGORIES
        </Link>
      </section>
      <Footer />
    </main>
  );
}
