import { proxyAdminChat } from '../chatProxy';

export async function GET(request: Request) {
  const query = new URL(request.url).search;
  return proxyAdminChat(request, `/api/chat/admin/conversations${query}`, 'GET');
}
