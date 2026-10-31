import { NextResponse } from "next/server";
import { getAdminSession, getOrdersServiceConfig } from "../orders/adminOrdersProxy";

export async function GET() {
  const session = await getAdminSession();
  if (session instanceof NextResponse) return session;
  const service = getOrdersServiceConfig();
  if ("error" in service) return service.error;

  try {
    const response = await fetch(`${service.url}/api/admin/users`, {
      headers: { "x-admin-orders-key": service.key },
      cache: "no-store",
    });
    const body = await response.json().catch(() => ({}));
    return NextResponse.json(body, { status: response.status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ message: "Could not reach the user service." }, { status: 502 });
  }
}
