const apiUrl = (process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:5000").replace(/\/+$/, "");

export type ProductReview = {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
};

export type ProductReviewSummary = {
  totalReviews: number;
  averageRating: number;
  ratingCounts: Record<1 | 2 | 3 | 4 | 5, number>;
};

export type ProductReviewPage = {
  reviews: ProductReview[];
  summary: ProductReviewSummary;
  pagination: { limit: number; skip: number; hasMore: boolean };
};

async function parseResponse<T>(response: Response): Promise<T> {
  const result = await response.json().catch(() => ({})) as T & { message?: string };
  if (!response.ok) throw new Error(result.message || "Could not load product reviews.");
  return result;
}

export async function getProductReviews(productId: string, skip = 0, limit = 20) {
  const query = new URLSearchParams({ skip: String(skip), limit: String(limit) });
  const response = await fetch(`${apiUrl}/api/products/${encodeURIComponent(productId)}/reviews?${query}`, {
    credentials: "include",
    cache: "no-store",
  });
  return parseResponse<ProductReviewPage>(response);
}

export async function saveProductReview(productId: string, rating: number, comment: string) {
  const response = await fetch(`${apiUrl}/api/products/${encodeURIComponent(productId)}/reviews`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rating, comment }),
  });
  return parseResponse<{ message: string; review: ProductReview }>(response);
}
