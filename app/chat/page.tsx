import type { Metadata } from 'next';
import { Suspense } from 'react';
import ChatClient from './ChatClient';

export const metadata: Metadata = {
  title: 'Chat with Soni Saree Showroom',
  description: 'Message our showroom team about products, stock, and orders.',
};

export default function ChatPage() {
  return <Suspense fallback={<main className="grid min-h-screen place-items-center bg-[#f6f2ed] text-sm text-[#776c75]">Opening your chat…</main>}><ChatClient /></Suspense>;
}
