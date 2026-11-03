import type { Page } from "@playwright/test";

export async function mockSignedOut(page: Page) {
  await page.route("**/api/auth/me", (route) =>
    route.fulfill({ status: 401, contentType: "application/json", body: "{}" }),
  );
}

export async function mockCatalog(page: Page, products: unknown[] = []) {
  await page.route("**/api/catalog/products**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ products }),
    }),
  );
}

export const sampleProduct = {
  _id: "product-1",
  productType: "saree",
  category: "Banarshi Silk",
  name: "Test Banarshi Saree",
  price: 2499,
  stock: 5,
  photo: { url: "https://example.com/saree-front.jpg" },
  additionalPhotos: [
    { url: "https://example.com/saree-back.jpg" },
    { url: "https://example.com/saree-detail.jpg" },
  ],
};

export function reviewPage(reviews: unknown[] = [], hasMore = false) {
  return {
    reviews,
    summary: {
      totalReviews: reviews.length,
      averageRating: reviews.length ? 5 : 0,
      ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: reviews.length },
    },
    pagination: { limit: 20, skip: 0, hasMore },
  };
}

export async function mockProductPage(page: Page, options?: {
  product?: typeof sampleProduct | null;
  status?: number;
  reviews?: unknown[];
  hasMoreReviews?: boolean;
}) {
  await mockSignedOut(page);
  const { product = sampleProduct, status = product ? 200 : 404, reviews = [], hasMoreReviews = false } = options ?? {};

  await page.route("**/api/catalog/products/product-1", (route) =>
    route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(product ? { product } : { message: "Product not found." }),
    }),
  );
  await page.route("**/api/catalog/products?**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ products: [] }) }),
  );
  await page.route("**/api/products/product-1/reviews**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(reviewPage(reviews, hasMoreReviews)),
    }),
  );
}
