"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiShoppingBag,
  FiZap,
  FiLoader,
  FiStar,
  FiX,
} from "react-icons/fi";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { useAuth } from "../../components/Auth/AuthProvider";
import { addCartItem } from "../../lib/cartApi";
import { openProductCheckout } from "../../lib/paymentApi";
import { useStockRefresh } from "../../lib/useStockRefresh";
import {
  getProductReviews,
  saveProductReview,
  type ProductReview,
  type ProductReviewSummary,
} from "../../lib/productReviewsApi";

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
  const [productResult, setProductResult] = useState<{
    id: string;
    product: Product | null;
    error: string;
  } | null>(null);
  const isLoading = productResult?.id !== productId;
  const product =
    productResult?.id === productId ? productResult.product : null;
  const error = productResult?.id === productId ? productResult.error : "";
  const [pendingAction, setPendingAction] = useState<"cart" | "buy" | null>(
    null,
  );
  const [relatedPendingAction, setRelatedPendingAction] = useState<{
    productId: string;
    action: "cart" | "buy";
  } | null>(null);
  const [notice, setNotice] = useState("");
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewsProductId, setReviewsProductId] = useState("");
  const [reviewSummary, setReviewSummary] =
    useState<ProductReviewSummary | null>(null);
  const reviewsLoading = reviewsProductId !== productId;
  const [reviewsError, setReviewsError] = useState("");
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewFormError, setReviewFormError] = useState("");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [photoSelection, setPhotoSelection] = useState({ productId, index: 0 });
  const activePhotoIndex =
    photoSelection.productId === productId ? photoSelection.index : 0;
  const photos = [product?.photo, ...(product?.additionalPhotos ?? [])].filter(
    (photo): photo is { url: string } => Boolean(photo?.url),
  );

  const refreshProductStock = useCallback(async () => {
    const response = await fetch(`/api/catalog/products/${encodeURIComponent(productId)}`, { cache: "no-store" });
    const result = await response.json().catch(() => ({}));
    if (response.ok && result.product) {
      setProductResult({ id: productId, product: result.product, error: "" });
    }
  }, [productId]);

  useStockRefresh(refreshProductStock);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/catalog/products/${encodeURIComponent(productId)}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok)
          throw new Error(result.message || "Could not load this product.");
        setProductResult({
          id: productId,
          product: result.product ?? null,
          error: "",
        });
      })
      .catch((loadError: unknown) => {
        if (!controller.signal.aborted) {
          setProductResult({
            id: productId,
            product: null,
            error:
              loadError instanceof Error
                ? loadError.message
                : "Could not load this product.",
          });
        }
      });
    return () => controller.abort();
  }, [productId]);

  useEffect(() => {
    if (!product || product._id !== productId) return;
    const controller = new AbortController();
    const params = new URLSearchParams({
      productType: product.productType,
      category: product.category,
      limit: "8",
    });
    setRelatedLoading(true);
    fetch(`/api/catalog/products?${params}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok)
          throw new Error(result.message || "Could not load related products.");
        setRelatedProducts(
          (result.products ?? [])
            .filter((item: Product) => item._id !== product._id)
            .slice(0, 4),
        );
      })
      .catch(() => {
        if (!controller.signal.aborted) setRelatedProducts([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setRelatedLoading(false);
      });
    return () => controller.abort();
  }, [product, productId]);

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
          setReviewsError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load reviews.",
          );
          setReviews([]);
          setReviewSummary(null);
          setHasMoreReviews(false);
        }
      });
    return () => {
      isActive = false;
    };
  }, [productId]);

  async function handleLoadMoreReviews() {
    setLoadingMoreReviews(true);
    setReviewsError("");
    try {
      const result = await getProductReviews(
        productId,
        reviewsProductId === productId ? reviews.length : 0,
      );
      setReviews((current) => [...current, ...result.reviews]);
      setReviewSummary(result.summary);
      setHasMoreReviews(result.pagination.hasMore);
    } catch (loadError) {
      setReviewsError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load more reviews.",
      );
    } finally {
      setLoadingMoreReviews(false);
    }
  }

  async function handleReviewSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
      openSignIn();
      return;
    }
    setReviewSubmitting(true);
    setReviewFormError("");
    try {
      await saveProductReview(productId, reviewRating, reviewComment);
      const result = await getProductReviews(productId);
      setReviews(result.reviews);
      setReviewSummary(result.summary);
      setHasMoreReviews(result.pagination.hasMore);
      setReviewComment("");
      setReviewModalOpen(false);
    } catch (submitError) {
      setReviewFormError(
        submitError instanceof Error
          ? submitError.message
          : "Could not save your review.",
      );
    } finally {
      setReviewSubmitting(false);
    }
  }

  useEffect(() => {
    if (!reviewModalOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !reviewSubmitting)
        setReviewModalOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [reviewModalOpen, reviewSubmitting]);

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
        await openProductCheckout(
          product._id,
          { name: user.name, email: user.email },
          {
            onVerified: (status, message) =>
              setNotice(
                status === "paid"
                  ? "Payment successful. Your order is pending and should arrive within 10 days."
                  : message || "Payment authorized and awaiting confirmation.",
              ),
            onFailure: setNotice,
            onDismiss: () =>
              setNotice("Checkout was closed. No payment was confirmed."),
          },
        );
      } else {
        const result = await addCartItem(product._id);
        setNotice(
          `Added to your cart · ${result.cart.totalItems} item${result.cart.totalItems === 1 ? "" : "s"} total`,
        );
      }
    } catch (actionError) {
      setNotice(
        actionError instanceof Error
          ? actionError.message
          : action === "buy"
            ? "Could not start checkout."
            : "Could not add this item to your cart.",
      );
    } finally {
      setPendingAction(null);
    }
  }

  async function handleRelatedAction(
    event: React.MouseEvent<HTMLButtonElement>,
    item: Product,
    action: "cart" | "buy",
  ) {
    event.preventDefault();
    event.stopPropagation();
    if (!user) {
      openSignIn();
      return;
    }
    setRelatedPendingAction({ productId: item._id, action });
    setNotice("");
    try {
      if (action === "buy") {
        await openProductCheckout(
          item._id,
          { name: user.name, email: user.email },
          {
            onVerified: (status, message) =>
              setNotice(
                status === "paid"
                  ? `Payment successful for ${item.name}. Your order is pending and should arrive within 10 days.`
                  : message || "Payment authorized and awaiting confirmation.",
              ),
            onFailure: setNotice,
            onDismiss: () =>
              setNotice("Checkout was closed. No payment was confirmed."),
          },
        );
      } else {
        const result = await addCartItem(item._id);
        setNotice(
          `${item.name} added to your cart · ${result.cart.totalItems} item${result.cart.totalItems === 1 ? "" : "s"} total`,
        );
      }
    } catch (actionError) {
      setNotice(
        actionError instanceof Error
          ? actionError.message
          : action === "buy"
            ? "Could not start checkout."
            : "Could not add this item to your cart.",
      );
    } finally {
      setRelatedPendingAction(null);
    }
  }

  return (
    <main className="relative isolate min-h-screen bg-[#faf7f2] text-[#302531]">
      <Header />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[220px] bg-gradient-to-br from-[#40233e] via-[#30172f] to-[#211821]" />
      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-8 pt-30 sm:px-6 lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="mb-4 flex w-fit max-w-full items-center gap-2 px-3 py-2 text-[11px] text-white/85 backdrop-blur-sm sm:text-xs"
        >
          <Link href="/" className="shrink-0 underline-offset-4 transition hover:text-white hover:underline">
            Home
          </Link>
          <span aria-hidden="true" className="text-white/55">/</span>
          <Link href="/categories" className="shrink-0 underline-offset-4 transition hover:text-white hover:underline">
            Collections
          </Link>
          <span aria-hidden="true" className="text-white/55">/</span>
          <span className="truncate font-semibold capitalize text-white">
            {product?.productType || "Product"}
          </span>
        </nav>

        {isLoading ? (
          <div className="grid animate-pulse gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-8">
            <div className="aspect-[4/4.2] w-full rounded-xl bg-[#eee6e0]" />
            <div className="space-y-4 py-2">
              <div className="h-3 w-28 rounded bg-[#eee6e0]" />
              <div className="h-9 w-3/4 rounded bg-[#eee6e0]" />
              <div className="h-6 w-32 rounded bg-[#f3efeb]" />
              <div className="h-28 rounded-xl bg-[#eee6e0]" />
              <div className="h-12 w-full rounded-lg bg-[#eee6e0]" />
            </div>
          </div>
        ) : error || !product ? (
          <div className="rounded-2xl border border-[#eadfd8] bg-[#fffdfa] px-6 py-16 text-center shadow-sm">
            <h1 className="font-serif text-3xl">Product unavailable</h1>
            <p role="alert" className="mt-2 text-sm text-[#777078]">
              {error || "We couldn’t find that product in the catalog."}
            </p>
            <Link
              href="/categories"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#30172f] px-5 text-xs font-semibold text-white"
            >
              Browse collections
            </Link>
          </div>
        ) : (
          <div className="grid items-start gap-5 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-8">
            <div className="w-full">
              <div className="relative mx-auto aspect-[4/4.15] max-h-[620px] overflow-hidden rounded-xl border border-[#ece3dc] bg-[#f1eae4] p-2 shadow-[0_8px_24px_rgba(43,27,38,0.06)] sm:p-3">
                <div className="relative h-full w-full overflow-hidden rounded-xl bg-[#f8f3ee]">
                  {photos.length ? (
                    <Image
                      src={photos[activePhotoIndex]?.url ?? photos[0].url}
                      alt={`${product.name} photo ${activePhotoIndex + 1}`}
                      fill
                      priority
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 45vw"
                      className="object-contain"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-sm text-[#817681]">
                      Product image unavailable
                    </div>
                  )}
                </div>
                <span className="absolute left-5 top-5 rounded-full border border-white/70 bg-[#fffdfa]/90 px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.16em] text-[#684768] shadow-sm backdrop-blur-sm">
                  {product.category}
                </span>
                {product.stock === 0 && <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-white/90 py-2 text-center text-sm font-bold tracking-[0.18em] text-[#b42323] shadow-sm">SOLD OUT · AVAILABLE SOON</span>}
                {photos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setPhotoSelection({
                          productId,
                          index:
                            (activePhotoIndex - 1 + photos.length) %
                            photos.length,
                        })
                      }
                      aria-label="Show previous product photo"
                      className="absolute left-5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#30172f] shadow transition hover:bg-white"
                    >
                      <FiChevronLeft size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPhotoSelection({
                          productId,
                          index: (activePhotoIndex + 1) % photos.length,
                        })
                      }
                      aria-label="Show next product photo"
                      className="absolute right-5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#30172f] shadow transition hover:bg-white"
                    >
                      <FiChevronRight size={20} />
                    </button>
                    <span className="absolute bottom-5 right-5 rounded-full bg-[#30172f]/80 px-2.5 py-1 text-[9px] font-medium text-white">
                      {activePhotoIndex + 1} / {photos.length}
                    </span>
                  </>
                )}
              </div>
              {photos.length > 1 && (
                <div
                  className="mt-2 flex gap-2 overflow-x-auto pb-1"
                  aria-label="Product photos"
                >
                  {photos.map((photo, index) => (
                    <button
                      key={`${photo.url}-${index}`}
                      type="button"
                      onClick={() => setPhotoSelection({ productId, index })}
                      aria-label={`Show product photo ${index + 1}`}
                      aria-current={
                        activePhotoIndex === index ? "true" : undefined
                      }
                      className={`relative h-[58px] w-[48px] shrink-0 overflow-hidden rounded-md border-2 transition ${activePhotoIndex === index ? "border-[#684768]" : "border-transparent opacity-70 hover:opacity-100"}`}
                    >
                      <Image
                        src={photo.url}
                        alt=""
                        fill
                        unoptimized
                        sizes="48px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-[#eadfd8] bg-[#fffdfa] p-4 shadow-[0_8px_24px_rgba(43,27,38,0.04)] sm:p-6 lg:p-7">
              <span className="inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#986d8f]">
                <span className="h-px w-5 bg-[#c7a9c0]" /> Soni Saree Showroom
              </span>
              <h1 className="mt-2 font-serif text-2xl leading-tight text-[#302531] sm:text-3xl">
                {product.name}
              </h1>
              <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.16em] text-[#897d87]">
                {product.productType}{" "}
                <span className="mx-1.5 text-[#c6b8c1]">·</span>{" "}
                {product.category}
              </p>
              {reviewsProductId === productId &&
                reviewSummary &&
                reviewSummary.totalReviews > 0 && (
                  <a
                    href="#reviews-heading"
                    className="mt-2 inline-flex items-center gap-1.5 text-[10px] text-[#684768] hover:underline"
                  >
                    <span className="flex items-center gap-0.5 text-[#a36c25]">
                      <FiStar size={12} fill="currentColor" />{" "}
                      {reviewSummary.averageRating.toFixed(1)}
                    </span>
                    <span>·</span>
                    <span>{reviewSummary.totalReviews} ratings</span>
                  </a>
                )}

              <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-y border-[#eee7e1] py-3">
                <div>
                  <p className="text-[8px] font-semibold tracking-[0.18em] text-[#918792]">
                    PRICE
                  </p>
                  <p className="mt-1 text-[28px] font-semibold tracking-tight text-[#30172f]">
                    {formatPrice(product.price)}
                  </p>
                  <p className="mt-0.5 text-[9px] text-[#928891]">
                    Inclusive of all taxes
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[9px] font-semibold ${product.stock > 0 ? "bg-[#edf4ee] text-[#54745f]" : "bg-[#fbefed] text-[#a13d39]"}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${product.stock > 0 ? "bg-[#668c70]" : "bg-[#b45a55]"}`}
                  />
                  {product.stock > 0
                    ? `${product.stock} available`
                    : "Available soon"}
                </span>
              </div>

              <div className="mt-4 rounded-lg bg-[#f8f3f6] p-3">
                <p className="text-[8px] font-semibold tracking-[0.18em] text-[#986d8f]">
                  PRODUCT DETAILS
                </p>
                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-[10px]">
                  <div>
                    <dt className="text-[#928891]">Collection</dt>
                    <dd className="mt-0.5 font-medium capitalize text-[#463847]">
                      {product.productType}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#928891]">Category</dt>
                    <dd className="mt-0.5 font-medium text-[#463847]">
                      {product.category}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#928891]">Availability</dt>
                    <dd className="mt-0.5 font-medium text-[#463847]">
                      {product.stock > 0
                        ? "Ready to add"
                        : "Currently unavailable"}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={product.stock < 1 || pendingAction !== null}
                  onClick={() => void handleCartAction("cart")}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#cbb8c8] bg-white px-4 text-[10px] font-semibold tracking-wide text-[#30172f] transition hover:bg-[#f6eef4] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pendingAction === "cart" ? (
                    <>
                      <FiRefreshCw className="animate-spin" size={15} /> Adding…
                    </>
                  ) : (
                    <>
                      <FiShoppingBag size={16} /> Add to cart
                    </>
                  )}
                </button>
                <button
                  type="button"
                  disabled={product.stock < 1 || pendingAction !== null}
                  onClick={() => void handleCartAction("buy")}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#30172f] px-4 text-[10px] font-semibold tracking-wide text-white transition hover:bg-[#593153] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pendingAction === "buy" ? (
                    <>
                      <FiLoader
                        size={13}
                        className="animate-spin"
                        aria-hidden="true"
                      />{" "}
                      Redirecting…
                    </>
                  ) : (
                    <>
                      <FiZap size={15} /> Buy now
                    </>
                  )}
                </button>
              </div>
              {notice && (
                <p aria-live="polite" className="mt-3 text-xs text-[#684768]">
                  {notice}
                </p>
              )}
              <p className="mt-4 text-center text-[9px] leading-4 text-[#918792]">
                Buy now opens Razorpay secure checkout. Your order is confirmed
                after payment verification.
              </p>
            </div>
          </div>
        )}
        {!isLoading && product && !error && (
          <>
            <section
              aria-labelledby="related-heading"
              className="mt-8 sm:mt-10"
            >
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#986d8f]">
                    Picked for you
                  </p>
                  <h2
                    id="related-heading"
                    className="mt-1 font-serif text-xl text-[#302531] sm:text-2xl"
                  >
                    Related products
                  </h2>
                </div>
                <Link
                  href="/categories"
                  className="text-[10px] font-semibold text-[#684768] hover:underline"
                >
                  Explore collections
                </Link>
              </div>
              {relatedLoading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="aspect-[3/4] animate-pulse rounded-xl bg-[#eee6e0]"
                    />
                  ))}
                </div>
              ) : relatedProducts.length ? (
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
                  {relatedProducts.map((item) => (
                    <article
                      key={item._id}
                      className={`group relative overflow-hidden rounded-lg border border-[#eadfd8] bg-[#fffdfa] transition ${item.stock > 0 ? "hover:-translate-y-0.5 hover:shadow-md" : "cursor-sold-out"}`}
                    >
                      <Link href={`/products/${item._id}`} onClick={(event) => { if (item.stock === 0) event.preventDefault(); }} aria-disabled={item.stock === 0} tabIndex={item.stock === 0 ? -1 : undefined} className="block">
                        <div className="relative aspect-[4/3.6] bg-[#f1eae4]">
                          {item.photo?.url ? (
                            <Image
                              src={item.photo.url}
                              alt={item.name}
                              fill
                              unoptimized
                              sizes="(max-width: 640px) 50vw, 25vw"
                              className="object-cover transition duration-500 group-hover:scale-[1.03]"
                            />
                          ) : (
                            <div className="grid h-full place-items-center text-xs text-[#817681]">
                              Photo unavailable
                            </div>
                          )}
                          <span className="absolute left-1.5 top-1.5 max-w-[calc(100%-12px)] truncate rounded-full bg-[#fffdfa]/90 px-1.5 py-0.5 text-[7px] font-semibold uppercase tracking-wide text-[#684768]">
                            {item.category}
                          </span>
                        </div>
                        <div className="p-2">
                          <h3 className="line-clamp-2 min-h-5 text-[10px] font-medium leading-4 text-[#463847] group-hover:text-[#684768]">
                            {item.name}
                          </h3>
                          <p className="mt-0.5 text-xs font-semibold text-[#30172f]">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                      </Link>
                      <div className="px-2 pb-2">
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            disabled={
                              item.stock < 1 ||
                              relatedPendingAction !== null ||
                              pendingAction !== null
                            }
                            onClick={(event) =>
                              void handleRelatedAction(event, item, "cart")
                            }
                            className="inline-flex min-h-8 items-center justify-center gap-1 rounded-md border border-[#cbb8c8] bg-white px-1.5 text-[8px] font-semibold text-[#30172f] transition hover:bg-[#f6eef4] disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={`Add ${item.name} to cart`}
                          >
                            {relatedPendingAction?.productId === item._id &&
                            relatedPendingAction.action === "cart" ? (
                              <FiRefreshCw size={11} className="animate-spin" />
                            ) : (
                              <FiShoppingBag size={11} />
                            )}
                            Add to cart
                          </button>
                          <button
                            type="button"
                            disabled={
                              item.stock < 1 ||
                              relatedPendingAction !== null ||
                              pendingAction !== null
                            }
                            onClick={(event) =>
                              void handleRelatedAction(event, item, "buy")
                            }
                            className="inline-flex min-h-8 items-center justify-center gap-1 rounded-md bg-[#30172f] px-1.5 text-[8px] font-semibold text-white transition hover:bg-[#593153] disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={`Buy ${item.name} now`}
                          >
                            {relatedPendingAction?.productId === item._id &&
                            relatedPendingAction.action === "buy" ? (
                              <FiLoader size={10} className="animate-spin" />
                            ) : (
                              <FiZap size={10} />
                            )}
                            Buy now
                          </button>
                        </div>
                        {item.stock < 1 && (
                          <p className="mt-1 text-center text-[8px] text-[#a13d39]">
                            Out of stock
                          </p>
                        )}
                      </div>
                      {item.stock === 0 && <div className="absolute inset-0 z-20 grid cursor-sold-out place-content-center gap-1 bg-white/75 text-center"><span className="text-xs font-bold tracking-[0.16em] text-[#b42323]">SOLD OUT</span><span className="text-[10px] font-semibold text-[#b42323]">Available soon</span></div>}
                    </article>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl border border-[#eadfd8] bg-[#fffdfa] px-4 py-6 text-center text-xs text-[#897d87]">
                  No similar products are available right now.
                </p>
              )}
            </section>

            <section
              aria-labelledby="reviews-heading"
              className="mt-8 rounded-xl border border-[#eadfd8] bg-[#fffdfa] p-4 shadow-[0_5px_18px_rgba(43,27,38,0.035)] sm:mt-10 sm:p-5 lg:p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#eee7e1] pb-3">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#986d8f]">
                    Customer reviews
                  </p>
                  <h2
                    id="reviews-heading"
                    className="mt-0.5 font-serif text-xl text-[#302531] sm:text-2xl"
                  >
                    Ratings &amp; comments
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {reviewsProductId === productId && reviewSummary && (
                    <div className="flex items-center gap-2 text-sm text-[#684768]">
                      <span className="flex items-center gap-1 font-semibold">
                        <FiStar size={16} fill="currentColor" />{" "}
                        {reviewSummary.averageRating.toFixed(1)}
                      </span>
                      <span className="text-xs text-[#897d87]">
                        ({reviewSummary.totalReviews}{" "}
                        {reviewSummary.totalReviews === 1
                          ? "review"
                          : "reviews"}
                        )
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (!user) {
                        openSignIn();
                        return;
                      }
                      setReviewFormError("");
                      setReviewModalOpen(true);
                    }}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#30172f] px-4 text-[10px] font-semibold tracking-wide text-white transition hover:bg-[#593153]"
                  >
                    <FiStar size={14} />
                    Review Product
                  </button>
                </div>
              </div>

              {reviewsProductId === productId &&
                reviewSummary &&
                reviewSummary.totalReviews > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg bg-[#faf7f2] px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-3xl text-[#30172f]">
                        {reviewSummary.averageRating.toFixed(1)}
                      </span>
                      <div>
                        <div
                          className="flex gap-0.5 text-[#a36c25]"
                          aria-label={`${reviewSummary.averageRating.toFixed(1)} out of 5 stars`}
                        >
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FiStar
                              key={star}
                              size={12}
                              fill={
                                star <= Math.round(reviewSummary.averageRating)
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                          ))}
                        </div>
                        <p className="mt-0.5 text-[9px] text-[#897d87]">
                          {reviewSummary.totalReviews} ratings
                        </p>
                      </div>
                    </div>
                    <div className="flex min-w-[210px] flex-1 items-center gap-2">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count =
                          reviewSummary.ratingCounts[
                            star as 1 | 2 | 3 | 4 | 5
                          ] ?? 0;
                        const width = reviewSummary.totalReviews
                          ? (count / reviewSummary.totalReviews) * 100
                          : 0;
                        return (
                          <div
                            key={star}
                            title={`${star} stars: ${count}`}
                            className="flex flex-1 flex-col items-center gap-1 text-[9px] text-[#897d87]"
                          >
                            <span>{count}</span>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e8e1db]">
                              <div
                                className="h-full rounded-full bg-[#b58b45]"
                                style={{ width: `${width}%` }}
                              />
                            </div>
                            <span>{star}★</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(260px,0.75fr)]">
                <div>
                  <h3 className="text-sm font-semibold text-[#463847]">
                    What customers say
                  </h3>
                  {reviewsLoading ? (
                    <p className="mt-3 text-xs text-[#897d87]">
                      Loading reviews…
                    </p>
                  ) : reviews.length ? (
                    <div className="mt-2 divide-y divide-[#eee7e1]">
                      {(showAllReviews ? reviews : reviews.slice(0, 5)).map(
                        (review) => (
                          <article key={review.id} className="py-3 first:pt-1">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <p className="text-[11px] font-semibold text-[#463847]">
                                {review.userName}
                              </p>
                              <div
                                className="flex gap-0.5 text-[#a36c25]"
                                aria-label={`${review.rating} out of 5 stars`}
                              >
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <FiStar
                                    key={star}
                                    size={10}
                                    fill={
                                      star <= review.rating
                                        ? "currentColor"
                                        : "none"
                                    }
                                  />
                                ))}
                              </div>
                              <time
                                className="ml-auto text-[9px] text-[#9a8e97]"
                                dateTime={review.createdAt}
                              >
                                {new Date(review.createdAt).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </time>
                            </div>
                            <p className="mt-1 whitespace-pre-wrap text-[11px] leading-[1.65] text-[#655b65]">
                              {review.comment}
                            </p>
                          </article>
                        ),
                      )}
                    </div>
                  ) : (
                    <p className="mt-4 rounded-lg bg-[#f8f3f6] px-4 py-5 text-xs text-[#897d87]">
                      No reviews yet. Be the first to share your thoughts.
                    </p>
                  )}
                  {reviewsError && (
                    <p role="alert" className="mt-3 text-xs text-[#a13d39]">
                      {reviewsError}
                    </p>
                  )}
                  {!showAllReviews && reviews.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setShowAllReviews(true)}
                      className="mt-2 text-[11px] font-semibold text-[#684768] hover:underline"
                    >
                      Show all {reviewSummary?.totalReviews ?? reviews.length}{" "}
                      reviews
                    </button>
                  )}
                  {showAllReviews && reviews.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setShowAllReviews(false)}
                      className="mt-2 text-[11px] font-semibold text-[#684768] hover:underline"
                    >
                      Show fewer reviews
                    </button>
                  )}
                  {reviewsProductId === productId && hasMoreReviews && (
                    <button
                      type="button"
                      disabled={loadingMoreReviews}
                      onClick={() => void handleLoadMoreReviews()}
                      className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#cbb8c8] px-4 text-xs font-semibold text-[#684768] transition hover:bg-[#f8f3f6] disabled:opacity-60"
                    >
                      {loadingMoreReviews && (
                        <FiRefreshCw className="animate-spin" size={13} />
                      )}
                      Load more reviews
                    </button>
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </section>
      {reviewModalOpen && product && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-[#1d1420]/55 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !reviewSubmitting)
              setReviewModalOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-modal-title"
            className="my-auto w-full max-w-lg rounded-2xl border border-[#eadfd8] bg-[#fffdfa] p-5 shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#986d8f]">
                  Customer review
                </p>
                <h2
                  id="review-modal-title"
                  className="mt-1 font-serif text-2xl text-[#302531]"
                >
                  Review {product.name}
                </h2>
                <p className="mt-1 text-xs text-[#897d87]">
                  Your review helps others choose with confidence.
                </p>
              </div>
              <button
                type="button"
                disabled={reviewSubmitting}
                onClick={() => setReviewModalOpen(false)}
                aria-label="Close review form"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#684768] transition hover:bg-[#f8f3f6] disabled:opacity-50"
              >
                <FiX size={19} />
              </button>
            </div>
            <form
              onSubmit={(event) => void handleReviewSubmit(event)}
              className="mt-6 space-y-4"
            >
              <fieldset>
                <legend className="text-xs font-medium text-[#655b65]">
                  Your rating
                </legend>
                <div
                  className="mt-2 flex gap-2"
                  role="radiogroup"
                  aria-label="Your rating"
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      role="radio"
                      aria-checked={reviewRating === star}
                      aria-label={`${star} star${star === 1 ? "" : "s"}`}
                      onClick={() => setReviewRating(star)}
                      className="rounded-md p-1 text-[#a36c25] focus-visible:outline-2 focus-visible:outline-[#986d8f]"
                    >
                      <FiStar
                        size={25}
                        fill={star <= reviewRating ? "currentColor" : "none"}
                      />
                    </button>
                  ))}
                </div>
              </fieldset>
              <label
                className="block text-xs font-medium text-[#655b65]"
                htmlFor="product-review-comment"
              >
                Your comment
                <textarea
                  id="product-review-comment"
                  required
                  minLength={1}
                  maxLength={1000}
                  rows={5}
                  value={reviewComment}
                  onChange={(event) => setReviewComment(event.target.value)}
                  placeholder="Share what you liked about this product…"
                  className="mt-2 w-full resize-y rounded-xl border border-[#e2d6df] bg-white p-3 text-sm leading-6 text-[#302531] outline-none placeholder:text-[#aaa0a9] focus:border-[#986d8f]"
                />
              </label>
              <p className="text-right text-[10px] text-[#9a8e97]">
                {reviewComment.length}/1000
              </p>
              {reviewFormError && (
                <p role="alert" className="text-xs text-[#a13d39]">
                  {reviewFormError}
                </p>
              )}
              <button
                type="submit"
                disabled={reviewSubmitting || !reviewComment.trim()}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#30172f] px-4 text-xs font-semibold text-white transition hover:bg-[#593153] disabled:cursor-not-allowed disabled:opacity-55"
              >
                {reviewSubmitting && (
                  <FiRefreshCw className="animate-spin" size={14} />
                )}{" "}
                {reviewSubmitting ? "Saving…" : "Submit review"}
              </button>
              <p className="text-center text-[10px] text-[#897d87]">
                Submitting again updates your review for this product.
              </p>
            </form>
          </section>
        </div>
      )}
      <Footer />
    </main>
  );
}
