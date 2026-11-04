"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { FiPause, FiPlay, FiStar } from "react-icons/fi";
import {
  getAllProductReviews,
  type ProductReview,
} from "../../lib/productReviewsApi";

function ReviewCard({ review }: { review: ProductReview }) {
  const initial = review.userName.trim().charAt(0).toLocaleUpperCase() || "S";

  return (
    <article className="group relative flex h-[135px] w-[clamp(264px,29vw,320px)] shrink-0 flex-col overflow-hidden rounded-2xl border border-[#eadfd8] bg-gradient-to-br from-white via-[#fffdfa] to-[#faf5f8] p-4 shadow-[0_10px_28px_rgba(48,23,47,0.08)] transition duration-300 hover:-translate-y-1 hover:border-[#d9c6d5] hover:shadow-[0_16px_36px_rgba(48,23,47,0.14)] max-[380px]:w-[min(82vw,300px)] max-[380px]:p-3.5 before:absolute before:inset-y-4 before:left-0 before:w-[3px] before:rounded-r-full before:bg-[#b79263] before:content-['']" aria-label={`Review by ${review.userName}`}>
      <span aria-hidden="true" className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-[#f2eaf1]/70 transition duration-500 group-hover:scale-110" />
      <div className="relative flex min-w-0 items-center gap-2.5">
        <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-white bg-gradient-to-br from-[#f5ebf3] to-[#e8d9e7] font-serif text-lg font-bold text-[#684768] shadow-[0_3px_10px_rgba(48,23,47,0.12)]" aria-hidden="true">
          <span>{initial}</span>
          {review.userPicture && (
            <Image
              src={review.userPicture}
              alt=""
              fill
              unoptimized
              sizes="44px"
              className="object-cover"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 break-words text-[13px] font-semibold leading-4 text-[#382d38]" title={review.userName}>{review.userName}</h3>
          <span className="mt-1.5 flex gap-0.5 text-[#b27c35]" aria-label={`${review.rating} out of 5 stars`}>
            {Array.from({ length: 5 }, (_, index) => (
              <FiStar key={index} className="h-3 w-3 stroke-[1.8]" aria-hidden="true" fill={index < review.rating ? "currentColor" : "none"} />
            ))}
          </span>
        </div>
        <span className="relative inline-flex shrink-0 items-center gap-1 rounded-full border border-[#efe1c9] bg-[#fff9ef] px-2 py-1 text-[10px] font-bold text-[#90652f]">
          <FiStar className="h-3 w-3 fill-current" aria-hidden="true" />{review.rating}.0
        </span>
      </div>
      <div className="relative mt-3 flex min-h-0 flex-1 items-start gap-2.5 rounded-xl border border-[#f0e9e4] bg-white/75 px-3 py-2.5">
        <span aria-hidden="true" className="-mt-1 font-serif text-[28px] leading-none text-[#b79263]/70">“</span>
        <p className="line-clamp-4 break-words pt-0.5 text-[11px] leading-[1.55] text-[#6d626c]" title={review.comment}>{review.comment}</p>
      </div>
    </article>
  );
}

function ReviewGroup({ reviews, duplicate = false }: { reviews: ProductReview[]; duplicate?: boolean }) {
  return (
    <div className="flex shrink-0 gap-3.5 pr-3.5" aria-hidden={duplicate || undefined}>
      {reviews.map((review) => (
        <ReviewCard key={`${duplicate ? "copy-" : ""}${review.id}`} review={review} />
      ))}
    </div>
  );
}

export function ShowReviews() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadReviews() {
      try {
        const allReviews: ProductReview[] = [];
        let skip = 0;
        let hasMore = true;

        while (hasMore && !controller.signal.aborted) {
          const page = await getAllProductReviews(skip, 100, controller.signal);
          allReviews.push(...page.reviews);
          skip += page.reviews.length;
          hasMore = page.pagination.hasMore && page.reviews.length > 0;
        }

        if (!controller.signal.aborted) {
          setReviews(allReviews);
          setError("");
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(loadError instanceof Error ? loadError.message : "Could not load customer reviews.");
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadReviews();
    return () => controller.abort();
  }, [retryKey]);

  const canMove = reviews.length > 1;

  return (
    <section className="mx-auto max-w-6xl px-[5%] pb-8 pt-1 md:px-0" aria-labelledby="customer-reviews-title">
      <style>{`@keyframes review-marquee { to { transform: translateX(-50%); } }`}</style>
      <div className="mb-5 flex items-end justify-between gap-4 max-[639px]:items-center">
        <div>
          <p className="text-[9px] font-bold tracking-[0.2em] text-[#986d8f]">KIND WORDS FROM OUR CUSTOMERS</p>
          <h2 id="customer-reviews-title" className="mt-[7px] font-serif text-[clamp(22px,3vw,30px)] leading-[1.15] text-[#302531]">Stories from the Soni family</h2>
        </div>
        {canMove && (
          <button
            type="button"
            className="inline-flex min-h-9 shrink-0 items-center gap-[7px] rounded-full border border-[#e4d9e2] px-3 text-[10px] font-semibold text-[#684768] transition hover:border-[#cbb8c8] hover:bg-[#f8f3f7] max-[639px]:h-9 max-[639px]:w-9 max-[639px]:justify-center max-[639px]:px-0"
            onClick={() => setIsPaused((paused) => !paused)}
            aria-label={isPaused ? "Play customer reviews" : "Pause customer reviews"}
            aria-pressed={isPaused}
          >
            {isPaused ? <FiPlay aria-hidden="true" /> : <FiPause aria-hidden="true" />}
            <span className="max-[639px]:sr-only">{isPaused ? "Play" : "Pause"}</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex gap-3.5 overflow-hidden" aria-label="Loading customer reviews" aria-busy="true">
          {[0, 1, 2].map((item) => <div className="h-[174px] w-[clamp(264px,29vw,320px)] shrink-0 animate-pulse rounded-[14px] border border-[#eee5e0] bg-[#f5f0ec]" key={item} />)}
        </div>
      ) : error ? (
        <div className="rounded-[14px] border border-dashed border-[#dfd3dd] bg-[#fffdfa] p-6 text-center text-xs text-[#817681]" role="status">
          <p>{error}</p>
          <button className="mt-2 font-bold text-[#684768] underline underline-offset-[3px]" type="button" onClick={() => { setIsLoading(true); setError(""); setRetryKey((key) => key + 1); }}>Try again</button>
        </div>
      ) : reviews.length ? (
        <div
          className={`group overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_2%,#000_98%,transparent)] motion-reduce:overflow-x-auto motion-reduce:[mask-image:none]`}
          role="region"
          aria-label="Customer reviews"
        >
          <div
            className={`flex w-max ${canMove ? `animate-[review-marquee_60s_linear_infinite] motion-reduce:animate-none group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] ${isPaused ? "[animation-play-state:paused]" : ""}` : ""}`}
            style={canMove ? { animationDuration: `${Math.max(48, reviews.length * 9)}s` } : undefined}
          >
            <ReviewGroup reviews={reviews} />
            {canMove && <ReviewGroup reviews={reviews} duplicate />}
          </div>
        </div>
      ) : (
        <p className="rounded-[14px] border border-dashed border-[#dfd3dd] bg-[#fffdfa] p-6 text-center text-xs text-[#817681]">Customer stories will appear here after the first review.</p>
      )}
    </section>
  );
}

export default ShowReviews;
