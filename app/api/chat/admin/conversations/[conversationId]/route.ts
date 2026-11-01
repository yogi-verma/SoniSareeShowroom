import { proxyAdminChat } from '../../chatProxy';

type RouteContext = { params: Promise<{ conversationId: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  const { conversationId } = await params;
  const body = await request.json().catch(() => ({}));
  return proxyAdminChat(request, `/api/chat/admin/conversations/${encodeURIComponent(conversationId)}`, 'PATCH', body);
}
