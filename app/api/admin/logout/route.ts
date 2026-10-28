import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ADMIN_API_URL = (
  process.env.ADMIN_BACKEND_URL
  || process.env.NEXT_PUBLIC_ADMIN_API_URL
  || "http://localhost:5001"
).replace(/\/$/, "");

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("adminToken")?.value;
  let status = 200;
  let responseBody: { loggedIn: boolean; message: string } = {
    loggedIn: false,
    message: "Logged out successfully.",
  };

  if (token) {
    try {
      const backendResponse = await fetch(`${ADMIN_API_URL}/logoutout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      responseBody = await backendResponse.json().catch(() => responseBody);
      status = backendResponse.status;
    } catch {
      status = 502;
      responseBody = { loggedIn: false, message: "Could not reach the admin server." };
    }
  }

  cookieStore.set("adminToken", "", {
    httpOnly: true,
    secure: new URL(request.url).protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return NextResponse.json(responseBody, { status });
}
