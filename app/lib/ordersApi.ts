const authApiUrl = (process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:5000").replace(/\/+$/, "");

export type OrderLineItem = {
  productId: string;
  name: string;
  productType: string;
  category: string;
  photoUrl: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type OrderSummary = {
  id: string;
  productId: string;
  productName: string;
  productType: string;
  category: string;
  productPhotoUrl: string;
  quantity: number;
  itemCount: number;
  items: OrderLineItem[];
  unitPrice: number;
  totalAmount: number;
  currency: string;
  paymentStatus: "paid";
  deliveryStatus: "pending" | "delivered";
  deliveryMessage: string;
  deliveredAt: string | null;
  paymentMethod: string;
  paidAt: string | null;
  placedAt: string;
};

export type OrderDetail = OrderSummary & {
  customerName: string;
  customerEmail: string;
  receipt: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
};

async function request<T>(email: string, orderId?: string): Promise<T> {
  const path = `/api/users/me/${encodeURIComponent(email)}/orders${orderId ? `/${encodeURIComponent(orderId)}` : ""}`;
  const response = await fetch(`${authApiUrl}${path}`, {
    credentials: "include",
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({})) as T & { message?: string };
  if (!response.ok) throw new Error(result.message || "Could not load your orders.");
  return result;
}

export function getMyOrders(email: string) {
  return request<{ totalOrders: number; orders: OrderSummary[] }>(email);
}

export function getMyOrder(email: string, orderId: string) {
  return request<{ order: OrderDetail }>(email, orderId);
}
