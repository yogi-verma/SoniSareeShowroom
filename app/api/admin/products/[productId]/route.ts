import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ADMIN_API_URL = (
  process.env.ADMIN_BACKEND_URL
  || process.env.NEXT_PUBLIC_ADMIN_API_URL
  || "http://localhost:5001"
).replace(/\/$/, "");

async function adminToken() {
  return (await cookies()).get("adminToken")?.value;
}

type RouteContext = { params: Promise<{ productId: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  const token = await adminToken();
  if (!token) return NextResponse.json({ message: "Admin authentication is required." }, { status: 401 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ message: "A valid multipart form body is required." }, { status: 400 });
  }

  const { productId } = await params;
  try {
    const backendResponse = await fetch(`${ADMIN_API_URL}/api/products/${encodeURIComponent(productId)}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
      cache: "no-store",
    });
    const responseBody = await backendResponse.json().catch(() => ({}));
    return NextResponse.json(responseBody, { status: backendResponse.status });
  } catch {
    return NextResponse.json({ message: "Could not reach the admin server." }, { status: 502 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const token = await adminToken();
  if (!token) return NextResponse.json({ message: "Admin authentication is required." }, { status: 401 });

  const { productId } = await params;
  try {
    const backendResponse = await fetch(`${ADMIN_API_URL}/api/products/${encodeURIComponent(productId)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const responseBody = await backendResponse.json().catch(() => ({}));
    return NextResponse.json(responseBody, { status: backendResponse.status });
  } catch {
    return NextResponse.json({ message: "Could not reach the admin server." }, { status: 502 });
  }
}
