import { NextResponse } from "next/server";
import { getAdminSession, getOrdersServiceConfig } from "../../adminOrdersProxy";

type RouteContext = { params: Promise<{ orderId: string }> };

export async function PATCH(_request: Request, { params }: RouteContext) {
  const session = await getAdminSession();
  if (session instanceof NextResponse) return session;
  const service = getOrdersServiceConfig();
  if ("error" in service) return service.error;
  const { orderId } = await params;

  try {
    const response = await fetch(`${service.url}/api/admin/orders/${encodeURIComponent(orderId)}/deliver`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-orders-key": service.key },
      body: JSON.stringify({ deliveredBy: session.name }),
      cache: "no-store",
    });
    const body = await response.json().catch(() => ({}));
    return NextResponse.json(body, { status: response.status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ message: "Could not reach the order service." }, { status: 502 });
  }
}
