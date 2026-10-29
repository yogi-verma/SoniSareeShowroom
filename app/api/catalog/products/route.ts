import { NextResponse } from "next/server";

const ADMIN_API_URL = (
  process.env.ADMIN_BACKEND_URL
  || process.env.NEXT_PUBLIC_ADMIN_API_URL
  || "http://localhost:5001"
).replace(/\/$/, "");

export async function GET(request: Request) {
  const query = new URL(request.url).search;
  try {
    const backendResponse = await fetch(`${ADMIN_API_URL}/api/catalog/products${query}`, {
      cache: "no-store",
    });
    const responseBody = await backendResponse.json().catch(() => ({}));
    return NextResponse.json(responseBody, {
      status: backendResponse.status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ message: "Could not load the saree collection." }, { status: 502 });
  }
}
