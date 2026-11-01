"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiRefreshCw, FiShoppingBag, FiZap, FiLoader, FiStar } from "react-icons/fi";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { useAuth } from "../../components/Auth/AuthProvider";
import { addCartItem } from "../../lib/cartApi";
import { openProductCheckout } from "../../lib/paymentApi";
import { getProductReviews, saveProductReview, type ProductReview, type ProductReviewSummary } from "../../lib/productReviewsApi";


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
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewsProductId, setReviewsProductId] = useState("");
  const [reviewSummary, setReviewSummary] = useState<ProductReviewSummary | null>(null);
  const reviewsLoading = reviewsProductId !== productId;
  const [reviewsError, setReviewsError] = useState("");
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewFormError, setReviewFormError] = useState("");
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

  useEffect(() => {
    let isActive = true;
    getProductReviews(productId)
      .then((result) => {
        if (!isActive) return;
        setReviewsProductId(productId);
        setReviewsError("");
        setReviews(result.reviews);
        setReviewSummary(result.summary);
        setHasMoreReviews(result.pagination.hasMore);
      })
      .catch((loadError: unknown) => {
        if (isActive) {
          setReviewsProductId(productId);
          setReviewsError(loadError instanceof Error ? loadError.message : "Could not load reviews.");
          setReviews([]);
          setReviewSummary(null);
          setHasMoreReviews(false);
        }
      });
    return () => { isActive = false; };
  }, [productId]);

  async function handleLoadMoreReviews() {
    setLoadingMoreReviews(true);
    setReviewsError("");
    try {
      const result = await getProductReviews(productId, reviewsProductId === productId ? reviews.length : 0);
      setReviews((current) => [...current, ...result.reviews]);
      setReviewSummary(result.summary);
      setHasMoreReviews(result.pagination.hasMore);
    } catch (loadError) {
      setReviewsError(loadError instanceof Error ? loadError.message : "Could not load more reviews.");
    } finally {
      setLoadingMoreReviews(false);
    }
  }

  async function handleReviewSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) { openSignIn(); return; }
    setReviewSubmitting(true);
    setReviewFormError("");
    setReviewMessage("");
    try {
      await saveProductReview(productId, reviewRating, reviewComment);
      const result = await getProductReviews(productId);
      setReviews(result.reviews);
      setReviewSummary(result.summary);
      setHasMoreReviews(result.pagination.hasMore);
      setReviewMessage("Your review has been saved.");
    } catch (submitError) {
      setReviewFormError(submitError instanceof Error ? submitError.message : "Could not save your review.");
    } finally {
      setReviewSubmitting(false);
    }
  }

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
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6 sm:pb-16 sm:pt-28 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-[10px] text-[#8b7f89] sm:mb-5 sm:text-[11px]">
          <Link href="/" className="transition hover:text-[#684768]">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/categories" className="transition hover:text-[#684768]">Collections</Link>
          <span aria-hidden="true">/</span>
          <span className="truncate font-medium capitalize text-[#684768]">{product?.productType || "Product"}</span>
        </nav>

        {isLoading ? (
          <div className="grid animate-pulse gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-8">
            <div className="aspect-[4/4.2] w-full rounded-xl bg-[#eee6e0]" />
            <div className="space-y-4 py-2"><div className="h-3 w-28 rounded bg-[#eee6e0]" /><div className="h-9 w-3/4 rounded bg-[#eee6e0]" /><div className="h-6 w-32 rounded bg-[#f3efeb]" /><div className="h-28 rounded-xl bg-[#eee6e0]" /><div className="h-12 w-full rounded-lg bg-[#eee6e0]" /></div>
          </div>
        ) : error || !product ? (
          <div className="rounded-2xl border border-[#eadfd8] bg-[#fffdfa] px-6 py-16 text-center shadow-sm">
            <h1 className="font-serif text-3xl">Product unavailable</h1>
            <p role="alert" className="mt-2 text-sm text-[#777078]">{error || "We couldn’t find that product in the catalog."}</p>
            <Link href="/categories" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#30172f] px-5 text-xs font-semibold text-white">Browse collections</Link>
          </div>
        ) : (
          <div className="grid items-start gap-5 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-8">
            <div className="w-full">
              <div className="relative mx-auto aspect-[4/4.15] max-h-[620px] overflow-hidden rounded-xl border border-[#ece3dc] bg-[#f1eae4] p-2 shadow-[0_8px_24px_rgba(43,27,38,0.06)] sm:p-3">
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
              {photos.length > 1 && <div className="mt-2 flex gap-2 overflow-x-auto pb-1" aria-label="Product photos">{photos.map((photo, index) => <button key={`${photo.url}-${index}`} type="button" onClick={() => setPhotoSelection({ productId, index })} aria-label={`Show product photo ${index + 1}`} aria-current={activePhotoIndex === index ? "true" : undefined} className={`relative h-[58px] w-[48px] shrink-0 overflow-hidden rounded-md border-2 transition ${activePhotoIndex === index ? "border-[#684768]" : "border-transparent opacity-70 hover:opacity-100"}`}><Image src={photo.url} alt="" fill unoptimized sizes="48px" className="object-cover" /></button>)}</div>}
            </div>

            <div className="rounded-xl border border-[#eadfd8] bg-[#fffdfa] p-4 shadow-[0_8px_24px_rgba(43,27,38,0.04)] sm:p-6 lg:p-7">
              <span className="inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#986d8f]"><span className="h-px w-5 bg-[#c7a9c0]" /> Soni Saree Showroom</span>
              <h1 className="mt-2 font-serif text-2xl leading-tight text-[#302531] sm:text-3xl">{product.name}</h1>
              <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.16em] text-[#897d87]">{product.productType} <span className="mx-1.5 text-[#c6b8c1]">·</span> {product.category}</p>
              {reviewsProductId === productId && reviewSummary && reviewSummary.totalReviews > 0 && <a href="#reviews-heading" className="mt-2 inline-flex items-center gap-1.5 text-[10px] text-[#684768] hover:underline"><span className="flex items-center gap-0.5 text-[#a36c25]"><FiStar size={12} fill="currentColor" /> {reviewSummary.averageRating.toFixed(1)}</span><span>·</span><span>{reviewSummary.totalReviews} ratings</span></a>}

              <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-y border-[#eee7e1] py-3">
                <div>
                  <p className="text-[8px] font-semibold tracking-[0.18em] text-[#918792]">PRICE</p>
                  <p className="mt-1 text-[28px] font-semibold tracking-tight text-[#30172f]">{formatPrice(product.price)}</p>
                  <p className="mt-0.5 text-[9px] text-[#928891]">Inclusive of all taxes</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[9px] font-semibold ${product.stock > 0 ? "bg-[#edf4ee] text-[#54745f]" : "bg-[#fbefed] text-[#a13d39]"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${product.stock > 0 ? "bg-[#668c70]" : "bg-[#b45a55]"}`} />
                  {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
                </span>
              </div>

              <div className="mt-4 rounded-lg bg-[#f8f3f6] p-3">
                <p className="text-[8px] font-semibold tracking-[0.18em] text-[#986d8f]">PRODUCT DETAILS</p>
                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-[10px]">
                  <div><dt className="text-[#928891]">Collection</dt><dd className="mt-0.5 font-medium capitalize text-[#463847]">{product.productType}</dd></div>
                  <div><dt className="text-[#928891]">Category</dt><dd className="mt-0.5 font-medium text-[#463847]">{product.category}</dd></div>
                  <div><dt className="text-[#928891]">Availability</dt><dd className="mt-0.5 font-medium text-[#463847]">{product.stock > 0 ? "Ready to add" : "Currently unavailable"}</dd></div>
                </dl>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
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
        {!isLoading && product && !error && (
          <section aria-labelledby="reviews-heading" className="mt-8 rounded-xl border border-[#eadfd8] bg-[#fffdfa] p-4 shadow-[0_5px_18px_rgba(43,27,38,0.035)] sm:mt-10 sm:p-5 lg:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#eee7e1] pb-3">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#986d8f]">Customer reviews</p>
                <h2 id="reviews-heading" className="mt-0.5 font-serif text-xl text-[#302531] sm:text-2xl">Ratings &amp; comments</h2>
              </div>
              {reviewsProductId === productId && reviewSummary && <div className="flex items-center gap-2 text-sm text-[#684768]">
                <span className="flex items-center gap-1 font-semibold"><FiStar size={16} fill="currentColor" /> {reviewSummary.averageRating.toFixed(1)}</span>
                <span className="text-xs text-[#897d87]">({reviewSummary.totalReviews} {reviewSummary.totalReviews === 1 ? "review" : "reviews"})</span>
              </div>}
            </div>

            {reviewsProductId === productId && reviewSummary && reviewSummary.totalReviews > 0 && <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg bg-[#faf7f2] px-3 py-2.5">
              <div className="flex items-center gap-2"><span className="font-serif text-3xl text-[#30172f]">{reviewSummary.averageRating.toFixed(1)}</span><div><div className="flex gap-0.5 text-[#a36c25]" aria-label={`${reviewSummary.averageRating.toFixed(1)} out of 5 stars`}>{[1, 2, 3, 4, 5].map((star) => <FiStar key={star} size={12} fill={star <= Math.round(reviewSummary.averageRating) ? "currentColor" : "none"} />)}</div><p className="mt-0.5 text-[9px] text-[#897d87]">{reviewSummary.totalReviews} ratings</p></div></div>
              <div className="flex min-w-[210px] flex-1 items-center gap-2">{[5, 4, 3, 2, 1].map((star) => { const count = reviewSummary.ratingCounts[star as 1 | 2 | 3 | 4 | 5] ?? 0; const width = reviewSummary.totalReviews ? (count / reviewSummary.totalReviews) * 100 : 0; return <div key={star} title={`${star} stars: ${count}`} className="flex flex-1 flex-col items-center gap-1 text-[9px] text-[#897d87]"><span>{count}</span><div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e8e1db]"><div className="h-full rounded-full bg-[#b58b45]" style={{ width: `${width}%` }} /></div><span>{star}★</span></div>; })}</div>
            </div>}

            <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(260px,0.75fr)]">
              <div>
                <h3 className="text-sm font-semibold text-[#463847]">What customers say</h3>
                {reviewsLoading ? <p className="mt-3 text-xs text-[#897d87]">Loading reviews…</p> : reviews.length ? <div className="mt-2 divide-y divide-[#eee7e1]">{(showAllReviews ? reviews : reviews.slice(0, 5)).map((review) => <article key={review.id} className="py-3 first:pt-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1"><p className="text-[11px] font-semibold text-[#463847]">{review.userName}</p><div className="flex gap-0.5 text-[#a36c25]" aria-label={`${review.rating} out of 5 stars`}>{[1, 2, 3, 4, 5].map((star) => <FiStar key={star} size={10} fill={star <= review.rating ? "currentColor" : "none"} />)}</div><time className="ml-auto text-[9px] text-[#9a8e97]" dateTime={review.createdAt}>{new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</time></div>
                  <p className="mt-1 whitespace-pre-wrap text-[11px] leading-[1.65] text-[#655b65]">{review.comment}</p>
                </article>)}</div> : <p className="mt-4 rounded-lg bg-[#f8f3f6] px-4 py-5 text-xs text-[#897d87]">No reviews yet. Be the first to share your thoughts.</p>}
                {reviewsError && <p role="alert" className="mt-3 text-xs text-[#a13d39]">{reviewsError}</p>}
                {!showAllReviews && reviews.length > 5 && <button type="button" onClick={() => setShowAllReviews(true)} className="mt-2 text-[11px] font-semibold text-[#684768] hover:underline">Show all {reviewSummary?.totalReviews ?? reviews.length} reviews</button>}
                {showAllReviews && reviews.length > 5 && <button type="button" onClick={() => setShowAllReviews(false)} className="mt-2 text-[11px] font-semibold text-[#684768] hover:underline">Show fewer reviews</button>}
                {reviewsProductId === productId && hasMoreReviews && <button type="button" disabled={loadingMoreReviews} onClick={() => void handleLoadMoreReviews()} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#cbb8c8] px-4 text-xs font-semibold text-[#684768] transition hover:bg-[#f8f3f6] disabled:opacity-60">{loadingMoreReviews && <FiRefreshCw className="animate-spin" size={13} />}Load more reviews</button>}
              </div>

              <div className="rounded-lg bg-[#f8f3f6] p-3 sm:p-4">
                <h3 className="text-sm font-semibold text-[#463847]">Write a review</h3>
                {user ? <form onSubmit={(event) => void handleReviewSubmit(event)} className="mt-3 space-y-3">
                  <fieldset><legend className="text-[10px] font-medium text-[#655b65]">Your rating</legend><div className="mt-1 flex gap-1" role="radiogroup" aria-label="Your rating">{[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" role="radio" aria-checked={reviewRating === star} aria-label={`${star} star${star === 1 ? "" : "s"}`} onClick={() => setReviewRating(star)} className="rounded p-1 text-[#a36c25] focus-visible:outline-2 focus-visible:outline-[#986d8f]"><FiStar size={20} fill={star <= reviewRating ? "currentColor" : "none"} /></button>)}</div></fieldset>
                  <label className="block text-[10px] font-medium text-[#655b65]" htmlFor="product-review-comment">Your comment<textarea id="product-review-comment" required minLength={1} maxLength={1000} rows={3} value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} placeholder="How was this product?" className="mt-1 w-full resize-y rounded-lg border border-[#e2d6df] bg-white p-2.5 text-xs leading-5 text-[#302531] outline-none placeholder:text-[#aaa0a9] focus:border-[#986d8f]" /></label>
                  <p className="text-right text-[9px] text-[#9a8e97]">{reviewComment.length}/1000</p>
                  {reviewFormError && <p role="alert" className="text-xs text-[#a13d39]">{reviewFormError}</p>}
                  {reviewMessage && <p role="status" className="text-xs text-[#54745f]">{reviewMessage}</p>}
                  <button type="submit" disabled={reviewSubmitting || !reviewComment.trim()} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#30172f] px-4 text-xs font-semibold text-white transition hover:bg-[#593153] disabled:cursor-not-allowed disabled:opacity-55">{reviewSubmitting && <FiRefreshCw className="animate-spin" size={13} />} {reviewSubmitting ? "Saving…" : "Submit review"}</button>
                  <p className="text-[9px] leading-4 text-[#897d87]">Submitting again updates your review for this product.</p>
                </form> : <div className="mt-3"><p className="text-xs leading-5 text-[#655b65]">Sign in to rate this product and leave a comment.</p><button type="button" onClick={openSignIn} className="mt-3 min-h-10 rounded-lg bg-[#30172f] px-4 text-xs font-semibold text-white transition hover:bg-[#593153]">Sign in to review</button></div>}
              </div>
            </div>
          </section>
        )}
      </section>
      <Footer />
    </main>
  );
}
