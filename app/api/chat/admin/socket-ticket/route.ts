import { proxyAdminChat } from '../chatProxy';

export async function POST(request: Request) {
  return proxyAdminChat(request, '/api/chat/admin/socket-ticket', 'POST');
}
