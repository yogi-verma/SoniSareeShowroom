import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ADMIN_API_URL = (
  process.env.ADMIN_BACKEND_URL
  || process.env.NEXT_PUBLIC_ADMIN_API_URL
  || "http://localhost:5001"
).replace(/\/$/, "");

export async function POST(request: Request) {
  let body: { password?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "A valid JSON body is required." }, { status: 400 });
  }

  if (typeof body.password !== "string" || !body.password) {
    return NextResponse.json({ message: "Password is required." }, { status: 400 });
  }

  let backendResponse: Response;
  try {
    backendResponse = await fetch(`${ADMIN_API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: body.password }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ message: "Could not reach the admin server." }, { status: 502 });
  }

  const responseBody = await backendResponse.json().catch(() => ({}));
  if (!backendResponse.ok) {
    return NextResponse.json(responseBody, { status: backendResponse.status });
  }

  const authorization = backendResponse.headers.get("authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) {
    return NextResponse.json({ message: "The admin server did not return a session token." }, { status: 502 });
  }

  const secure = new URL(request.url).protocol === "https:";
  const cookieStore = await cookies();
  cookieStore.set("adminToken", token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60,
  });

  return NextResponse.json(responseBody, { status: backendResponse.status });
}
