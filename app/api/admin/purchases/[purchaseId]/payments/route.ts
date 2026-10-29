import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ADMIN_API_URL = (
  process.env.ADMIN_BACKEND_URL
  || process.env.NEXT_PUBLIC_ADMIN_API_URL
  || "http://localhost:5001"
).replace(/\/$/, "");

export async function POST(request: Request, { params }: { params: Promise<{ purchaseId: string }> }) {
  const token = (await cookies()).get("adminToken")?.value;
  if (!token) {
    return NextResponse.json({ message: "Admin authentication is required." }, { status: 401 });
  }

  let payment: unknown;
  try {
    payment = await request.json();
  } catch {
    return NextResponse.json({ message: "A valid JSON body is required." }, { status: 400 });
  }

  const { purchaseId } = await params;
  try {
    const backendResponse = await fetch(`${ADMIN_API_URL}/api/purchases/${encodeURIComponent(purchaseId)}/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payment),
      cache: "no-store",
    });
    const responseBody = await backendResponse.json().catch(() => ({}));
    return NextResponse.json(responseBody, {
      status: backendResponse.status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ message: "Could not reach the admin server." }, { status: 502 });
  }
}
