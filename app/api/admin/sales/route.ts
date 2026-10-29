import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ADMIN_API_URL = (
  process.env.ADMIN_BACKEND_URL
  || process.env.NEXT_PUBLIC_ADMIN_API_URL
  || "http://localhost:5001"
).replace(/\/$/, "");

async function getAdminToken() {
  return (await cookies()).get("adminToken")?.value;
}

export async function GET(request: Request) {
  const token = await getAdminToken();
  if (!token) {
    return NextResponse.json({ message: "Admin authentication is required." }, { status: 401 });
  }

  const date = new URL(request.url).searchParams.get("date");
  const query = date ? `?date=${encodeURIComponent(date)}` : "";

  try {
    const backendResponse = await fetch(`${ADMIN_API_URL}/api/sales${query}`, {
      headers: { Authorization: `Bearer ${token}` },
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

export async function POST(request: Request) {
  const token = await getAdminToken();
  if (!token) {
    return NextResponse.json({ message: "Admin authentication is required." }, { status: 401 });
  }

  let transaction: unknown;
  try {
    transaction = await request.json();
  } catch {
    return NextResponse.json({ message: "A valid JSON body is required." }, { status: 400 });
  }

  try {
    const backendResponse = await fetch(`${ADMIN_API_URL}/api/sales`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transaction),
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
