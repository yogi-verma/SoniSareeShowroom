import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const CHAT_API_URL = (process.env.USER_BACKEND_URL || process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export async function proxyAdminChat(request: Request, path: string, method: 'GET' | 'POST' | 'PATCH', body?: unknown) {
  if (method !== 'GET') {
    const origin = request.headers.get('origin');
    if (origin && origin !== new URL(request.url).origin) {
      return NextResponse.json({ message: 'Requests from this origin are not allowed.' }, { status: 403 });
    }
  }
  const token = (await cookies()).get('adminToken')?.value;
  if (!token) return NextResponse.json({ message: 'Admin authentication is required.' }, { status: 401 });

  try {
    const response = await fetch(`${CHAT_API_URL}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      cache: 'no-store',
    });
    const result = await response.json().catch(() => ({}));
    return NextResponse.json(result, { status: response.status, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ message: 'Could not reach the chat service.' }, { status: 502 });
  }
}
