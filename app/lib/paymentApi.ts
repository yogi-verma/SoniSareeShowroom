const authApiUrl = (process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:5000").replace(/\/+$/, "");

export type PaymentOrder = {
  localOrderId: string;
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  productName: string;
};

export type RazorpayPaymentResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type CheckoutCustomer = { name?: string; email: string };
type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: CheckoutCustomer;
  theme: { color: string };
  handler: (response: RazorpayPaymentResponse) => void;
  modal: { ondismiss: () => void };
};
type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", callback: (response: { error?: { description?: string } }) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

async function request<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${authApiUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({})) as T & { message?: string };
  if (!response.ok) throw new Error(result.message || "Could not start payment.");
  return result;
}

export function createPaymentOrder(productId: string, quantity = 1) {
  return request<PaymentOrder>("/api/users/me/orders", { productId, quantity });
}

export function verifyPayment(localOrderId: string, payment: RazorpayPaymentResponse) {
  return request<{ verified: boolean; status: "paid" | "authorized"; orderId: string; message?: string }>(
    "/api/users/me/orders/verify",
    { localOrderId, ...payment },
  );
}

export function createCartPaymentOrder() {
  return request<PaymentOrder>("/api/users/me/cart/checkout");
}

function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load secure checkout. Check your connection and try again."));
    document.head.appendChild(script);
  });
}

async function openCheckout(
  orderRequest: Promise<PaymentOrder>,
  customer: CheckoutCustomer,
  callbacks: {
    onVerified: (status: "paid" | "authorized", message?: string) => void;
    onFailure: (message: string) => void;
    onDismiss: () => void;
  },
  clearCartAfterPayment: boolean,
) {
  const order = await orderRequest;
  await loadRazorpayCheckout();
  if (!window.Razorpay) throw new Error("Secure checkout did not initialize. Please try again.");

  const checkout = new window.Razorpay({
    key: order.keyId,
    amount: order.amount,
    currency: order.currency,
    name: "Soni Saree Showroom",
    description: order.productName,
    order_id: order.orderId,
    prefill: customer,
    theme: { color: "#30172f" },
    handler: (payment) => {
      void verifyPayment(order.localOrderId, payment)
        .then((verification) => {
          if (verification.status === "paid") {
            window.dispatchEvent(new Event("soni:order-updated"));
            if (clearCartAfterPayment) window.dispatchEvent(new Event("soni:cart-updated"));
          }
          callbacks.onVerified(verification.status, verification.message);
        })
        .catch((error: unknown) => callbacks.onFailure(error instanceof Error ? error.message : "Could not verify payment. Please contact support."));
    },
    modal: { ondismiss: callbacks.onDismiss },
  });
  checkout.on("payment.failed", (failure) => callbacks.onFailure(failure.error?.description || "Payment failed. Please try again."));
  checkout.open();
}

export function openProductCheckout(
  productId: string,
  customer: CheckoutCustomer,
  callbacks: Parameters<typeof openCheckout>[2],
) {
  return openCheckout(createPaymentOrder(productId), customer, callbacks, false);
}

export function openCartCheckout(
  customer: CheckoutCustomer,
  callbacks: Parameters<typeof openCheckout>[2],
) {
  return openCheckout(createCartPaymentOrder(), customer, callbacks, true);
}
