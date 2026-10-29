import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ADMIN_API_URL = (
  process.env.ADMIN_BACKEND_URL
  || process.env.NEXT_PUBLIC_ADMIN_API_URL
  || "http://localhost:5001"
).replace(/\/$/, "");

export async function GET() {
  const token = (await cookies()).get("adminToken")?.value;
  if (!token) {
    return NextResponse.json({ loggedIn: false, message: "Not signed in." }, { status: 401 });
  }

  try {
    const backendResponse = await fetch(`${ADMIN_API_URL}/loggedinadmin`, {
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
