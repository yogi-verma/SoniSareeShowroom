"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiRefreshCw, FiShoppingBag, FiZap, FiLoader } from "react-icons/fi";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { useAuth } from "../../components/Auth/AuthProvider";
import { addCartItem } from "../../lib/cartApi";
import { openProductCheckout } from "../../lib/paymentApi";


type Product = {
  _id: string;
  productType: string;
  category: string;
  name: string;
  price: number;
  stock: number;
  photo?: { url?: string };
  additionalPhotos?: { url?: string }[];
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function ProductDetail({ productId }: { productId: string }) {
  const { user, openSignIn } = useAuth();
  const [productResult, setProductResult] = useState<{ id: string; product: Product | null; error: string } | null>(null);
  const isLoading = productResult?.id !== productId;
  const product = productResult?.id === productId ? productResult.product : null;
  const error = productResult?.id === productId ? productResult.error : "";
  const [pendingAction, setPendingAction] = useState<"cart" | "buy" | null>(null);
  const [notice, setNotice] = useState("");
  const [photoSelection, setPhotoSelection] = useState({ productId, index: 0 });
  const activePhotoIndex = photoSelection.productId === productId ? photoSelection.index : 0;
  const photos = [product?.photo, ...(product?.additionalPhotos ?? [])].filter((photo): photo is { url: string } => Boolean(photo?.url));

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/catalog/products/${encodeURIComponent(productId)}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || "Could not load this product.");
        setProductResult({ id: productId, product: result.product ?? null, error: "" });
      })
      .catch((loadError: unknown) => {
        if (!controller.signal.aborted) {
          setProductResult({ id: productId, product: null, error: loadError instanceof Error ? loadError.message : "Could not load this product." });
        }
      });
    return () => controller.abort();
  }, [productId]);

  async function handleCartAction(action: "cart" | "buy") {
    if (!product) return;
    if (!user) {
      openSignIn();
      return;
    }
    setPendingAction(action);
    setNotice("");
    try {
      if (action === "buy") {
        await openProductCheckout(product._id, { name: user.name, email: user.email }, {
          onVerified: (status, message) => setNotice(status === "paid" ? "Payment successful. Your order is pending and should arrive within 10 days." : message || "Payment authorized and awaiting confirmation."),
          onFailure: setNotice,
          onDismiss: () => setNotice("Checkout was closed. No payment was confirmed."),
        });
      } else {
        const result = await addCartItem(product._id);
        setNotice(`Added to your cart · ${result.cart.totalItems} item${result.cart.totalItems === 1 ? "" : "s"} total`);
      }
    } catch (actionError) {
      setNotice(actionError instanceof Error ? actionError.message : action === "buy" ? "Could not start checkout." : "Could not add this item to your cart.");
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#302531]">
      <Header />
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-27 sm:px-8 sm:pb-20 sm:pt-32">
        <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-[10px] text-[#8b7f89] sm:mb-7 sm:text-xs">
          <Link href="/" className="transition hover:text-[#684768]">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/categories" className="transition hover:text-[#684768]">Collections</Link>
          <span aria-hidden="true">/</span>
          <span className="truncate font-medium capitalize text-[#684768]">{product?.productType || "Product"}</span>
        </nav>

        {isLoading ? (
          <div className="grid animate-pulse gap-8 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-12">
            <div className="mx-auto aspect-[4/5] w-full max-w-[430px] rounded-2xl bg-[#eee6e0]" />
            <div className="space-y-5 py-4 md:py-8"><div className="h-3 w-28 rounded bg-[#eee6e0]" /><div className="h-9 w-3/4 rounded bg-[#eee6e0]" /><div className="h-6 w-32 rounded bg-[#f3efeb]" /><div className="h-28 rounded-xl bg-[#eee6e0]" /><div className="h-12 w-full rounded-lg bg-[#eee6e0]" /></div>
          </div>
        ) : error || !product ? (
          <div className="rounded-2xl border border-[#eadfd8] bg-[#fffdfa] px-6 py-16 text-center shadow-sm">
            <h1 className="font-serif text-3xl">Product unavailable</h1>
            <p role="alert" className="mt-2 text-sm text-[#777078]">{error || "We couldn’t find that product in the catalog."}</p>
            <Link href="/categories" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#30172f] px-5 text-xs font-semibold text-white">Browse collections</Link>
          </div>
        ) : (
          <div className="grid items-start gap-8 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-12">
            <div className="mx-auto w-full max-w-[430px]">
              <div className="relative aspect-[4/5] max-h-[570px] overflow-hidden rounded-2xl border border-[#ece3dc] bg-[#f1eae4] p-2.5 shadow-[0_14px_38px_rgba(43,27,38,0.08)] sm:p-3.5">
                <div className="relative h-full w-full overflow-hidden rounded-xl bg-[#f8f3ee]">
                  {photos.length ? <Image src={photos[activePhotoIndex]?.url ?? photos[0].url} alt={`${product.name} photo ${activePhotoIndex + 1}`} fill priority unoptimized sizes="(max-width: 768px) 100vw, 45vw" className="object-contain" /> : <div className="grid h-full place-items-center text-sm text-[#817681]">Product image unavailable</div>}
                </div>
                <span className="absolute left-5 top-5 rounded-full border border-white/70 bg-[#fffdfa]/90 px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.16em] text-[#684768] shadow-sm backdrop-blur-sm">{product.category}</span>
                {photos.length > 1 && <>
                  <button type="button" onClick={() => setPhotoSelection({ productId, index: (activePhotoIndex - 1 + photos.length) % photos.length })} aria-label="Show previous product photo" className="absolute left-5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#30172f] shadow transition hover:bg-white"><FiChevronLeft size={20} /></button>
                  <button type="button" onClick={() => setPhotoSelection({ productId, index: (activePhotoIndex + 1) % photos.length })} aria-label="Show next product photo" className="absolute right-5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#30172f] shadow transition hover:bg-white"><FiChevronRight size={20} /></button>
                  <span className="absolute bottom-5 right-5 rounded-full bg-[#30172f]/80 px-2.5 py-1 text-[9px] font-medium text-white">{activePhotoIndex + 1} / {photos.length}</span>
                </>}
              </div>
              {photos.length > 1 && <div className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Product photos">{photos.map((photo, index) => <button key={`${photo.url}-${index}`} type="button" onClick={() => setPhotoSelection({ productId, index })} aria-label={`Show product photo ${index + 1}`} aria-current={activePhotoIndex === index ? "true" : undefined} className={`relative h-16 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition ${activePhotoIndex === index ? "border-[#684768]" : "border-transparent opacity-70 hover:opacity-100"}`}><Image src={photo.url} alt="" fill unoptimized sizes="56px" className="object-cover" /></button>)}</div>}
              <p className="mt-3 text-center text-[9px] tracking-wide text-[#9a8e97]">A closer look at this selected piece</p>
            </div>

            <div className="rounded-2xl border border-[#eadfd8] bg-[#fffdfa] p-5 shadow-[0_12px_36px_rgba(43,27,38,0.06)] sm:p-7 lg:p-8">
              <span className="inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#986d8f]"><span className="h-px w-5 bg-[#c7a9c0]" /> Soni Saree Showroom</span>
              <h1 className="mt-3 font-serif text-3xl leading-tight text-[#302531] sm:text-4xl">{product.name}</h1>
              <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.16em] text-[#897d87]">{product.productType} <span className="mx-1.5 text-[#c6b8c1]">·</span> {product.category}</p>

              <div className="mt-6 flex flex-wrap items-end justify-between gap-3 border-y border-[#eee7e1] py-4">
                <div>
                  <p className="text-[8px] font-semibold tracking-[0.18em] text-[#918792]">PRICE</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-[#30172f]">{formatPrice(product.price)}</p>
                  <p className="mt-0.5 text-[9px] text-[#928891]">Inclusive of all taxes</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[9px] font-semibold ${product.stock > 0 ? "bg-[#edf4ee] text-[#54745f]" : "bg-[#fbefed] text-[#a13d39]"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${product.stock > 0 ? "bg-[#668c70]" : "bg-[#b45a55]"}`} />
                  {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
                </span>
              </div>

              <div className="mt-5 rounded-xl bg-[#f8f3f6] p-4">
                <p className="text-[8px] font-semibold tracking-[0.18em] text-[#986d8f]">PRODUCT DETAILS</p>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-[10px]">
                  <div><dt className="text-[#928891]">Collection</dt><dd className="mt-0.5 font-medium capitalize text-[#463847]">{product.productType}</dd></div>
                  <div><dt className="text-[#928891]">Category</dt><dd className="mt-0.5 font-medium text-[#463847]">{product.category}</dd></div>
                  <div><dt className="text-[#928891]">Availability</dt><dd className="mt-0.5 font-medium text-[#463847]">{product.stock > 0 ? "Ready to add" : "Currently unavailable"}</dd></div>
                </dl>
              </div>

              <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                <button type="button" disabled={product.stock < 1 || pendingAction !== null} onClick={() => void handleCartAction("cart")} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#cbb8c8] bg-white px-4 text-[10px] font-semibold tracking-wide text-[#30172f] transition hover:bg-[#f6eef4] disabled:cursor-not-allowed disabled:opacity-50">
                  {pendingAction === "cart" ? <><FiRefreshCw className="animate-spin" size={15} /> Adding…</> : <><FiShoppingBag size={16} /> Add to cart</>}
                </button>
                <button type="button" disabled={product.stock < 1 || pendingAction !== null} onClick={() => void handleCartAction("buy")} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#30172f] px-4 text-[10px] font-semibold tracking-wide text-white transition hover:bg-[#593153] disabled:cursor-not-allowed disabled:opacity-50">
                  {pendingAction === "buy" ? <><FiLoader size={13} className="animate-spin" aria-hidden="true" /> Redirecting…</> : <><FiZap size={15} /> Buy now</>}
                </button>
              </div>
              {notice && <p aria-live="polite" className="mt-3 text-xs text-[#684768]">{notice}</p>}
              <p className="mt-4 text-center text-[9px] leading-4 text-[#918792]">Buy now opens Razorpay secure checkout. Your order is confirmed after payment verification.</p>
            </div>
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
