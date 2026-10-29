const API_BASE_URL = (process.env.NEXT_PUBLIC_ADMIN_API_URL || "http://localhost:5001").replace(/\/$/, "");

type Admin = {
  id: string;
  name: string;
};

type AdminAuthResponse = {
  message: string;
  admin: Admin;
};

export type Purchase = {
  _id: string;
  companyName: string;
  place: string;
  description: string;
  category: string;
  total_price: number;
  purchaseDate?: string;
  createdAt: string;
};

export type PurchaseInput = Omit<Purchase, "_id" | "createdAt" | "purchaseDate"> & { purchaseDate: string };

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

type AdminRequestOptions = {
  method: "GET" | "POST";
  body?: Record<string, string | number>;
};

async function sendAdminRequest<T>(path: string, options: AdminRequestOptions): Promise<T> {
  let response: Response;
  const requestUrl = path.startsWith("/api/admin/") ? path : `${API_BASE_URL}${path}`;

  try {
    response = await fetch(requestUrl, {
      method: options.method,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
      },
      credentials: "include",
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
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
  return sendAdminRequest<AdminAuthResponse>("/login", { method: "POST", body: { password } });
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
  return sendAdminRequest<{ purchases: Purchase[] }>("/api/purchases", { method: "GET" });
}

export function createPurchase(purchase: PurchaseInput) {
  return sendAdminRequest<{ message: string; purchase: Purchase }>("/api/purchases", {
    method: "POST",
    body: purchase,
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

export type { Admin, AdminAuthResponse };
