import { proxyAdminChat } from '../../../chatProxy';

type RouteContext = { params: Promise<{ conversationId: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  const { conversationId } = await params;
  const query = new URL(request.url).search;
  return proxyAdminChat(request, `/api/chat/admin/conversations/${encodeURIComponent(conversationId)}/messages${query}`, 'GET');
}

export async function POST(request: Request, { params }: RouteContext) {
  const { conversationId } = await params;
  const body = await request.json().catch(() => ({}));
  return proxyAdminChat(request, `/api/chat/admin/conversations/${encodeURIComponent(conversationId)}/messages`, 'POST', body);
}
