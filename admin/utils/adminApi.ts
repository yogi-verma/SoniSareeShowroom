const API_BASE_URL = (process.env.NEXT_PUBLIC_ADMIN_API_URL || "http://localhost:5001").replace(/\/$/, "");

type Admin = {
  id: string;
  name: string;
};

type AdminAuthResponse = {
  message: string;
  admin: Admin;
  token?: string;
};

async function sendAdminRequest<T>(path: string, body: Record<string, string>): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Could not reach the admin server. Make sure it is running on port 5001.");
  }

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || "The request could not be completed.");
  }

  return result as T;
}

export function loginAdmin(password: string) {
  return sendAdminRequest<AdminAuthResponse>("/login", { password });
}

export function createAdmin(name: string, password: string) {
  return sendAdminRequest<AdminAuthResponse>("/create", { name, password });
}

export type { Admin, AdminAuthResponse };
