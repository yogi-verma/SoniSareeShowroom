const API_BASE_URL = (process.env.NEXT_PUBLIC_ADMIN_API_URL || "http://localhost:5001").replace(/\/$/, "");

type Admin = {
  id: string;
  name: string;
};

type AdminAuthResponse = {
  message: string;
  admin: Admin;
};

export type PurchaseItem = {
  _id?: string;
  name: string;
  description: string;
  quantity: number;
  per_price: number;
  total?: number;
};

export type Purchase = {
  _id: string;
  companyName: string;
  place: string;
  description: string;
  category: string;
  items?: PurchaseItem[];
  subtotal?: number;
  gstPercent?: number;
  gstAmount?: number;
  total_price: number;
  payments?: PurchasePayment[];
  paidAmount?: number;
  paymentStatus?: "paid" | "pending";
  purchaseDate?: string;
  createdAt: string;
};

export type PurchaseItemInput = Omit<PurchaseItem, "_id" | "total">;

export type PurchasePaymentMethod = "cash" | "online" | "cheque";

export type PurchasePayment = {
  _id?: string;
  amount: number;
  method: PurchasePaymentMethod;
  paidAt: string;
};

export type PurchaseInput = {
  companyName: string;
  place: string;
  description?: string;
  category: string;
  items: PurchaseItemInput[];
  gstPercent: number;
  /** Sent for compatibility with older deployed purchase controllers; the current API recalculates this from items and GST. */
  total_price: number;
  initialPaidAmount: number;
  paymentMethod?: PurchasePaymentMethod;
  purchaseDate: string;
};

export type PurchasePaymentInput = {
  amount: number;
  method: PurchasePaymentMethod;
};

export type AdminOrderItem = {
  productId: string;
  name: string;
  productType: string;
  category: string;
  photoUrl: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type AdminOrder = {
  id: string;
  receipt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: AdminOrderItem[];
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  paymentId: string;
  paidAt: string | null;
  deliveryStatus: "pending" | "delivered";
  deliveredAt: string | null;
  deliveredBy: string;
};

export type AdminOrdersResponse = {
  totalSuccessfullyDelivered: number;
  pendingOrders: number;
  orders: AdminOrder[];
  completedOrders: number;
  completed: AdminOrder[];
};

export type SalesTransactionType = "online" | "cash" | "expense";

export type SalesTransaction = {
  _id: string;
  transactionType: SalesTransactionType;
  amount: number;
  description: string;
  transactionDate: string;
  createdAt: string;
};

export type SalesTransactionInput = Omit<SalesTransaction, "_id" | "createdAt">;

export type DailySalesInput = {
  onlineAmount: number;
  cashAmount: number;
  miscellaneousAmount: number;
  transactionDate: string;
};

export type ProductType = "saree" | "shut" | "rajputi poshak";
export type ProductCategory = "Banarshi Silk" | "Kanjiviram Silk" | "Cotton and Handloom" | "Georgette & Chiffron" | "Bandhani";

export type Product = {
  _id: string;
  productType: ProductType;
  category: ProductCategory;
  name: string;
  price: number;
  stock: number;
  photo: { url: string; publicId: string };
  createdAt: string;
  updatedAt: string;
};

export type ProductInput = Omit<Product, "_id" | "photo" | "createdAt" | "updatedAt"> & {
  photo: File;
};

type AdminRequestOptions = {
  method: "GET" | "POST" | "PATCH";
  body?: Record<string, unknown> | FormData;
};

async function sendAdminRequest<T>(path: string, options: AdminRequestOptions): Promise<T> {
  let response: Response;
  const requestUrl = path.startsWith("/api/admin/") ? path : `${API_BASE_URL}${path}`;
  const requestBody: BodyInit | undefined = options.body === undefined
    ? undefined
    : options.body instanceof FormData
      ? options.body
      : JSON.stringify(options.body);

  try {
    const isMultipartBody = options.body instanceof FormData;
    response = await fetch(requestUrl, {
      method: options.method,
      headers: {
        ...(options.body && !isMultipartBody ? { "Content-Type": "application/json" } : {}),
      },
      credentials: "include",
      ...(requestBody ? { body: requestBody } : {}),
    });
  } catch {
    throw new Error("Could not reach the admin server. Please try again shortly.");
  }

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.message || "The request could not be completed.") as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return result as T;
}

export function loginAdmin(password: string) {
  return sendAdminRequest<AdminAuthResponse>("/api/admin/login", { method: "POST", body: { password } });
}

export function createAdmin(name: string, password: string) {
  return sendAdminRequest<AdminAuthResponse>("/create", { method: "POST", body: { name, password } });
}

export function getLoggedInAdmin() {
  return sendAdminRequest<{ loggedIn: boolean; admin: Admin }>("/api/admin/session", { method: "GET" });
}

export function logoutAdmin() {
  return sendAdminRequest<{ loggedIn: boolean; message: string }>("/api/admin/logout", { method: "POST" });
}

export function getPurchases() {
  return sendAdminRequest<{ purchases: Purchase[] }>("/api/admin/purchases", { method: "GET" });
}

export function getAdminOrders() {
  return sendAdminRequest<AdminOrdersResponse>("/api/admin/orders", { method: "GET" });
}

export function markAdminOrderDelivered(orderId: string) {
  return sendAdminRequest<{ message: string; order: AdminOrder }>(`/api/admin/orders/${encodeURIComponent(orderId)}/deliver`, { method: "PATCH" });
}

export function createPurchase(purchase: PurchaseInput) {
  return sendAdminRequest<{ message: string; purchase: Purchase }>("/api/admin/purchases", {
    method: "POST",
    body: purchase,
  });
}

export function addPurchasePayment(purchaseId: string, payment: PurchasePaymentInput) {
  return sendAdminRequest<{ message: string; purchase: Purchase }>(`/api/admin/purchases/${encodeURIComponent(purchaseId)}/payments`, {
    method: "POST",
    body: payment,
  });
}

export function getSalesTransactions(date?: string) {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  return sendAdminRequest<{ transactions: SalesTransaction[] }>(`/api/admin/sales${query}`, { method: "GET" });
}

export function createSalesTransaction(transaction: SalesTransactionInput) {
  return sendAdminRequest<{ message: string; transaction: SalesTransaction }>("/api/admin/sales", {
    method: "POST",
    body: transaction,
  });
}

export function createDailySales(dailySales: DailySalesInput) {
  return sendAdminRequest<{ message: string; transactions: SalesTransaction[] }>("/api/admin/sales/daily", {
    method: "POST",
    body: dailySales,
  });
}

export function getProducts() {
  return sendAdminRequest<{ products: Product[] }>("/api/admin/products", { method: "GET" });
}

export function createProduct(product: ProductInput) {
  const body = new FormData();
  body.append("productType", product.productType);
  body.append("category", product.category);
  body.append("name", product.name);
  body.append("price", String(product.price));
  body.append("stock", String(product.stock));
  body.append("photo", product.photo);

  return sendAdminRequest<{ message: string; product: Product }>("/api/admin/products", {
    method: "POST",
    body,
  });
}

export type { Admin, AdminAuthResponse };
