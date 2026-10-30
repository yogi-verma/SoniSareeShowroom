export type CartItem = {
  productId: string;
  name: string;
  productType: string;
  category: string;
  unitPrice: number;
  photoUrl: string;
  quantity: number;
  availableStock: number;
  isAvailable: boolean;
  lineTotal: number;
};

export type Cart = {
  items: CartItem[];
  distinctItems: number;
  totalItems: number;
  subtotal: number;
};

type CartResponse = { cart: Cart; message?: string };
const authApiUrl = (process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:5000").replace(/\/+$/, "");

async function requestCart(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (init.body) headers.set("Content-Type", "application/json");
  const response = await fetch(`${authApiUrl}/api/users/me/cart${path}`, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({})) as CartResponse & { message?: string };
  if (!response.ok) throw new Error(result.message || "Could not update your cart.");
  return result;
}

function announceCartChange() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("soni:cart-updated"));
}

export async function getCart() {
  const result = await requestCart("");
  return result.cart;
}

export async function addCartItem(productId: string, quantity = 1) {
  const result = await requestCart("/items", {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
  });
  announceCartChange();
  return result;
}

export async function updateCartItem(productId: string, quantity: number) {
  const result = await requestCart(`/items/${encodeURIComponent(productId)}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
  announceCartChange();
  return result;
}

export async function removeCartItem(productId: string) {
  const result = await requestCart(`/items/${encodeURIComponent(productId)}`, { method: "DELETE" });
  announceCartChange();
  return result;
}

export async function clearCart() {
  const result = await requestCart("", { method: "DELETE" });
  announceCartChange();
  return result;
}
