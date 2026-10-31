import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ADMIN_BACKEND_URL = (process.env.ADMIN_BACKEND_URL || process.env.NEXT_PUBLIC_ADMIN_API_URL || "http://localhost:5001").replace(/\/$/, "");
const USERS_BACKEND_URL = (process.env.USER_BACKEND_URL || process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:5000").replace(/\/$/, "");

export type AdminSession = { name: string };

export async function getAdminSession(): Promise<AdminSession | NextResponse> {
  const token = (await cookies()).get("adminToken")?.value;
  if (!token) return NextResponse.json({ message: "Admin authentication is required." }, { status: 401 });

  try {
    const response = await fetch(`${ADMIN_BACKEND_URL}/loggedinadmin`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const result = await response.json().catch(() => ({})) as { admin?: { name?: string } };
    if (!response.ok || !result.admin?.name) {
      return NextResponse.json({ message: "Admin authentication is required." }, { status: 401 });
    }
    return { name: result.admin.name };
  } catch {
    return NextResponse.json({ message: "Could not verify the admin session." }, { status: 502 });
  }
}

export function getOrdersServiceConfig() {
  const key = process.env.ADMIN_ORDERS_API_KEY;
  if (!key) return { error: NextResponse.json({ message: "Admin order access is not configured." }, { status: 503 }) };
  return { url: USERS_BACKEND_URL, key };
}
