'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { FiArrowLeft, FiArrowUpRight, FiCheck, FiChevronLeft, FiMessageCircle, FiMoreHorizontal, FiPackage, FiSearch, FiSend, FiShield, FiShoppingBag, FiWifi, FiWifiOff } from 'react-icons/fi';
import { useAuth } from '../components/Auth/AuthProvider';

const AUTH_API = (process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
const WS_URL = `${AUTH_API.replace(/^http/, 'ws')}/ws/chat`;

type ChatMessage = { id: string; conversationId: string; senderType: 'user' | 'admin'; senderId: string; body: string; createdAt: string };
type Conversation = {
  id: string;
  user?: { id: string; name: string; email: string; picture?: string };
  status: 'open' | 'closed';
  lastMessage: string;
  lastMessageAt: string;
  lastMessageBy: 'user' | 'admin';
  unreadByAdmin: number;
  unreadByUser?: number;
};

function initials(name = 'S') { return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'S'; }
function formatTime(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(date);
}
function formatDay(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return 'Today';
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(date);
}

export default function ChatClient() {
  const { user, isLoading, openSignIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAdmin = searchParams.get('mode') === 'admin';
  const selectedId = searchParams.get('conversationId');
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(isAdmin);
  const [adminName, setAdminName] = useState('Showroom team');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasOlderMessages, setHasOlderMessages] = useState(false);
  const [olderMessageCursor, setOlderMessageCursor] = useState<string | null>(null);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [connection, setConnection] = useState<'connecting' | 'online' | 'offline'>('connecting');
  const [notice, setNotice] = useState('');
  const [mobileInbox, setMobileInbox] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const preservedScrollRef = useRef<{ height: number; top: number } | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const isAdminRef = useRef(isAdmin);

  useEffect(() => { isAdminRef.current = isAdmin; }, [isAdmin]);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
    setConversation((current) => current ? { ...current, lastMessage: message.body, lastMessageAt: message.createdAt, lastMessageBy: message.senderType } : current);
    setConversation((current) => current || (!isAdminRef.current ? { id: message.conversationId, status: 'open', lastMessage: message.body, lastMessageAt: message.createdAt, lastMessageBy: message.senderType, unreadByAdmin: 0, unreadByUser: 0 } : current));
    setConversations((current) => current.map((item) => item.id === message.conversationId ? {
      ...item, lastMessage: message.body, lastMessageAt: message.createdAt, lastMessageBy: message.senderType,
      unreadByAdmin: isAdminRef.current && message.senderType === 'user' && item.id !== selectedId ? item.unreadByAdmin + 1 : item.unreadByAdmin,
    } : item).sort((a, b) => +new Date(b.lastMessageAt) - +new Date(a.lastMessageAt)));
  }, [selectedId]);

  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    fetch('/api/admin/session', { cache: 'no-store' })
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.loggedIn) throw new Error('Your admin session has expired.');
        if (active) { setIsAdminVerified(true); setAdminName(result.admin?.name || 'Showroom team'); }
      })
      .catch(() => { if (active) setNotice('Your admin session is unavailable. Please sign in to the admin dashboard and try again.'); })
      .finally(() => { if (active) setCheckingAdmin(false); });
    return () => { active = false; };
  }, [isAdmin]);

  const reloadInbox = useCallback(async () => {
    const response = await fetch('/api/chat/admin/conversations?limit=100', { cache: 'no-store' });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || 'Could not load conversations.');
    const openConversationId = new URLSearchParams(window.location.search).get('conversationId');
    setConversations((result.conversations || []).map((item: Conversation) => item.id === openConversationId ? { ...item, unreadByAdmin: 0 } : item));
  }, []);

  useEffect(() => {
    if (isAdmin && isAdminVerified) Promise.resolve().then(reloadInbox).catch((error: Error) => setNotice(error.message));
  }, [isAdmin, isAdminVerified, reloadInbox]);

  useEffect(() => {
    let active = true;
    if (isLoading || (isAdmin && !isAdminVerified)) return;
    const load = async () => {
      await Promise.resolve();
      if (!active) return;
      setLoadingHistory(true);
      let response: Response;
      if (isAdmin) {
        if (!selectedId) { setConversation(null); setMessages([]); setLoadingHistory(false); return; }
        response = await fetch(`/api/chat/admin/conversations/${encodeURIComponent(selectedId)}/messages?limit=50`, { cache: 'no-store' });
      } else if (user) {
        response = await fetch(`${AUTH_API}/api/chat/me?limit=50`, { credentials: 'include', cache: 'no-store' });
      } else {
        setConversation(null); setMessages([]); setLoadingHistory(false); return;
      }
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || 'Could not load chat history.');
      if (!active) return;
      const loadedConversation = isAdmin
        ? { ...result.conversation, id: result.conversation?.id || selectedId, user: result.conversation?.userId && typeof result.conversation.userId === 'object' ? result.conversation.userId : result.conversation?.user }
        : result.conversation;
      setConversation(loadedConversation || null);
      setMessages(result.messages || []);
      setHasOlderMessages(Boolean(result.pagination?.hasMore));
      setOlderMessageCursor(result.pagination?.nextBefore || null);
      setNotice('');
    };
    load().catch((error: Error) => { if (active) setNotice(error.message); })
      .finally(() => { if (active) setLoadingHistory(false); });
    return () => { active = false; };
  }, [isAdmin, isAdminVerified, isLoading, selectedId, user]);

  useEffect(() => {
    if (isLoading || (!isAdmin && !user) || (isAdmin && !isAdminVerified)) return;
    let active = true;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let retryDelay = 800;
    let currentSocket: WebSocket | null = null;
    const connect = async () => {
      if (!active) return;
      setConnection('connecting');
      try {
        let url = `${WS_URL}?role=${isAdmin ? 'admin' : 'user'}`;
        if (isAdmin) {
          const ticketResponse = await fetch('/api/chat/admin/socket-ticket', { method: 'POST', cache: 'no-store' });
          const ticketResult = await ticketResponse.json().catch(() => ({}));
          if (!ticketResponse.ok || !ticketResult.ticket) throw new Error('Could not authorize chat connection.');
          url += `&ticket=${encodeURIComponent(ticketResult.ticket)}`;
        }
        if (!active) return;
        currentSocket = new WebSocket(url);
        socketRef.current = currentSocket;
        currentSocket.onopen = () => { retryDelay = 800; setConnection('online'); };
        currentSocket.onmessage = (event) => {
          try {
            const payload = JSON.parse(String(event.data)) as { type: string; message?: ChatMessage | string };
            if (payload.type === 'message' && payload.message && typeof payload.message !== 'string') {
              addMessage(payload.message);
              if (isAdminRef.current) void reloadInbox().catch((error: Error) => setNotice(error.message));
            }
            if (payload.type === 'error' && typeof payload.message === 'string') setNotice(payload.message);
          } catch { /* Ignore malformed socket frames and keep the connection alive. */ }
        };
        currentSocket.onclose = () => {
          setConnection('offline');
          if (active) { retryTimer = setTimeout(connect, retryDelay); retryDelay = Math.min(retryDelay * 1.8, 12000); }
        };
        currentSocket.onerror = () => currentSocket?.close();
      } catch {
        setConnection('offline');
        if (active) { retryTimer = setTimeout(connect, retryDelay); retryDelay = Math.min(retryDelay * 1.8, 12000); }
      }
    };
    void connect();
    return () => { active = false; if (retryTimer) clearTimeout(retryTimer); currentSocket?.close(); if (socketRef.current === currentSocket) socketRef.current = null; };
  }, [addMessage, isAdmin, isAdminVerified, isLoading, reloadInbox, user]);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    if (preservedScrollRef.current) {
      const previous = preservedScrollRef.current;
      list.scrollTop = previous.top + (list.scrollHeight - previous.height);
      preservedScrollRef.current = null;
      return;
    }
    list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const visibleConversations = useMemo(() => conversations.filter((item) => `${item.user?.name || ''} ${item.user?.email || ''} ${item.lastMessage}`.toLowerCase().includes(search.toLowerCase())), [conversations, search]);
  const otherName = isAdmin ? conversation?.user?.name || conversations.find((item) => item.id === selectedId)?.user?.name || 'Customer' : adminName;
  const canChat = isAdmin ? isAdminVerified : Boolean(user);

  function openConversation(id: string) {
    setMobileInbox(false);
    router.push(`/chat?mode=admin&conversationId=${encodeURIComponent(id)}`);
  }

  async function sendMessage(event?: FormEvent) {
    event?.preventDefault();
    const body = draft.trim();
    if (!body || sending || !canChat || body.length > 2000) return;
    setSending(true); setNotice('');
    try {
      const socket = socketRef.current;
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'message', body, ...(isAdmin && selectedId ? { conversationId: selectedId } : {}) }));
        setDraft('');
        return;
      }
      let response: Response;
      if (isAdmin) {
        if (!selectedId) throw new Error('Choose a customer conversation first.');
        response = await fetch(`/api/chat/admin/conversations/${encodeURIComponent(selectedId)}/messages`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body }),
        });
      } else {
        response = await fetch(`${AUTH_API}/api/chat/me/messages`, {
          method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body }),
        });
      }
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || 'Your message could not be sent.');
      addMessage(result.message);
      if (result.conversation && !isAdmin) setConversation(result.conversation);
      setDraft('');
      if (isAdmin) void reloadInbox();
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Your message could not be sent.'); }
    finally { setSending(false); }
  }

  async function toggleConversationStatus() {
    if (!selectedId || !conversation) return;
    const status = conversation.status === 'open' ? 'closed' : 'open';
    const response = await fetch(`/api/chat/admin/conversations/${encodeURIComponent(selectedId)}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) { setNotice(result.message || 'Could not update this conversation.'); return; }
    setConversation((current) => current ? { ...current, status } : current);
    void reloadInbox();
  }

  async function loadOlderMessages() {
    if (!hasOlderMessages || !olderMessageCursor || loadingOlderMessages) return;
    setLoadingOlderMessages(true);
    try {
      const query = `?limit=50&before=${encodeURIComponent(olderMessageCursor)}`;
      const path = isAdmin
        ? `/api/chat/admin/conversations/${encodeURIComponent(selectedId || '')}/messages${query}`
        : `${AUTH_API}/api/chat/me${query}`;
      const response = await fetch(path, { credentials: 'include', cache: 'no-store' });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || 'Could not load earlier messages.');
      if (listRef.current) preservedScrollRef.current = { height: listRef.current.scrollHeight, top: listRef.current.scrollTop };
      setMessages((current) => [...(result.messages || []), ...current]);
      setHasOlderMessages(Boolean(result.pagination?.hasMore));
      setOlderMessageCursor(result.pagination?.nextBefore || null);
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Could not load earlier messages.'); }
    finally { setLoadingOlderMessages(false); }
  }

  function handleComposerKey(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void sendMessage(); }
  }

  if (checkingAdmin || isLoading) return <main className="grid min-h-screen place-items-center bg-[#f6f2ed]"><div className="flex items-center gap-3 rounded-2xl border border-[#eee5df] bg-white px-5 py-4 text-sm text-[#766c75] shadow-sm"><span className="h-2 w-2 animate-pulse rounded-full bg-[#a77d45]" /> Preparing your private chat…</div></main>;

  if (!canChat) return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(ellipse_at_top,_#fff_0%,_#f8f2f5_45%,_#f5f0e9_100%)] px-5 text-[#312832]">
      <section className="max-w-md rounded-[28px] border border-[#eee5df] bg-white p-8 text-center shadow-[0_24px_80px_rgba(56,33,52,0.12)] sm:p-10">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#f6edf4] text-[#684768]"><FiMessageCircle size={26} /></span>
        <p className="mt-6 text-[10px] font-bold tracking-[.24em] text-[#a77d45]">SONI SAREE SHOWROOM</p>
        <h1 className="mt-2 font-serif text-3xl">Let’s talk</h1>
        <p className="mt-3 text-sm leading-6 text-[#777078]">Sign in to ask about a piece, check availability, or get help with an order.</p>
        {notice && <p role="alert" className="mt-4 text-xs text-[#a13d39]">{notice}</p>}
        {!isAdmin && <button type="button" onClick={openSignIn} className="mt-7 min-h-12 w-full rounded-xl bg-[#401d3c] px-5 text-sm font-semibold text-white shadow-lg shadow-[#401d3c]/15 transition hover:bg-[#32162f]">Sign in to chat</button>}
        <Link href={isAdmin ? '/admin/sonisaree' : '/'} className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#766c75] hover:text-[#401d3c]"><FiArrowLeft size={14} /> {isAdmin ? 'Back to admin' : 'Back to showroom'}</Link>
      </section>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#f6f2ed] p-0 text-[#2f2730] sm:p-5 lg:p-8">
      <section className="mx-auto flex min-h-screen max-w-[1440px] flex-col overflow-hidden bg-white shadow-[0_20px_80px_rgba(43,26,42,0.10)] sm:min-h-[calc(100vh-40px)] sm:rounded-[26px] sm:border sm:border-[#eee5df] lg:min-h-[calc(100vh-64px)]">
        <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-[#eee8e3] bg-white px-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            {isAdmin ? <Link href="/admin/sonisaree" aria-label="Back to admin dashboard" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#eee5df] text-[#5a4a59] transition hover:bg-[#f8f4f7]"><FiArrowLeft size={18} /></Link> : <Link href="/" aria-label="Back to showroom" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#401d3c] font-serif text-lg text-white">❋</Link>}
            <span className="min-w-0">
              <span className="block truncate font-serif text-[19px] leading-6">{isAdmin ? 'Customer conversations' : 'Chat with us'}</span>
              <span className="mt-0.5 block truncate text-[11px] text-[#958b93]">{isAdmin ? 'Soni Saree Showroom · Admin workspace' : 'Personal help, from our showroom team'}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-semibold sm:inline-flex ${connection === 'online' ? 'bg-[#edf7f1] text-[#397556]' : 'bg-[#f6f3f0] text-[#8d838b]'}`}>
              {connection === 'online' ? <FiWifi size={12} /> : <FiWifiOff size={12} />}{connection === 'online' ? 'Live' : connection === 'connecting' ? 'Connecting' : 'Reconnecting'}
            </span>
            {!isAdmin && <Link href="/categories" className="hidden items-center gap-2 rounded-full border border-[#eee5df] px-3 py-2 text-[11px] font-semibold text-[#665966] transition hover:border-[#d8c4d4] hover:bg-[#fbf8fb] sm:flex">Explore collection <FiArrowUpRight size={13} /></Link>}
            {isAdmin && <span className="grid h-9 w-9 place-items-center rounded-full bg-[#f5edf3] font-serif text-sm text-[#684768]">{initials(adminName)}</span>}
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          {isAdmin && (
            <aside className={`${mobileInbox && selectedId ? 'flex' : selectedId ? 'hidden' : 'flex'} w-full shrink-0 flex-col border-r border-[#eee8e3] bg-[#fdfcfa] md:flex md:w-[330px] lg:w-[360px]`}>
              <div className="border-b border-[#eee8e3] px-5 pb-4 pt-5 sm:px-6">
                <div className="flex items-center justify-between"><span className="text-[10px] font-bold tracking-[.18em] text-[#a77d45]">INBOX</span><span className="rounded-full bg-[#f2eaf1] px-2.5 py-1 text-[10px] font-bold text-[#684768]">{conversations.length}</span></div>
                <h1 className="mt-1 font-serif text-[23px]">Messages</h1>
                <p className="mt-1 text-[11px] text-[#8b8189]">Private conversations with your customers</p>
                <label className="mt-4 flex h-10 items-center gap-2.5 rounded-xl border border-[#eee7e3] bg-white px-3 text-[#9b9299] focus-within:border-[#cdb8ca]"><FiSearch size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a customer" className="min-w-0 flex-1 bg-transparent text-xs text-[#352d35] outline-none placeholder:text-[#aaa1a7]" /></label>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-2.5">
                {visibleConversations.length ? visibleConversations.map((item) => {
                  const active = selectedId === item.id;
                  return <button type="button" key={item.id} onClick={() => openConversation(item.id)} className={`flex w-full items-start gap-3 rounded-2xl p-3.5 text-left transition ${active ? 'bg-[#f3ebf2] shadow-sm' : 'hover:bg-[#f7f4f1]'}`}>
                    <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#e8d9e5] font-serif text-sm text-[#684768]">{item.user?.picture ? <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.user.picture} alt="" className="h-full w-full rounded-full object-cover" />
                    </> : initials(item.user?.name)}<i className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#6b9b7a]" /></span>
                    <span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="truncate text-[13px] font-semibold text-[#362c36]">{item.user?.name || 'Customer'}</span><span className="shrink-0 text-[9px] text-[#9a9098]">{formatDay(item.lastMessageAt)}</span></span><span className="mt-0.5 block truncate text-[10px] text-[#928891]">{item.user?.email}</span><span className="mt-2 flex items-center justify-between gap-2"><span className="truncate text-[11px] text-[#766d76]">{item.lastMessage}</span>{item.unreadByAdmin > 0 && <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-[#401d3c] px-1.5 text-[9px] font-bold text-white">{item.unreadByAdmin}</span>}</span></span>
                  </button>;
                }) : <div className="mx-3 mt-10 rounded-2xl border border-dashed border-[#e8dfd9] px-5 py-8 text-center"><span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-white text-[#ad9eaa]"><FiMessageCircle size={18} /></span><p className="mt-3 text-xs font-semibold text-[#514650]">{search ? 'No matching customers' : 'Your inbox is ready'}</p><p className="mt-1 text-[10px] leading-4 text-[#9a9098]">New customer messages will appear here.</p></div>}
              </div>
              <div className="border-t border-[#eee8e3] px-5 py-3 text-[10px] text-[#9a9098]">{conversations.reduce((sum, item) => sum + item.unreadByAdmin, 0)} unread messages</div>
            </aside>
          )}

          <section className={`${isAdmin && (!selectedId || mobileInbox) ? 'hidden md:flex' : 'flex'} min-w-0 flex-1 flex-col bg-[#fbf9f6]`}>
            {(!isAdmin || selectedId) ? <>
              <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#eee8e3] bg-white px-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                  {isAdmin && <button type="button" onClick={() => setMobileInbox(true)} aria-label="Back to conversations" className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#766d76] hover:bg-[#f5f0f4] md:hidden"><FiChevronLeft size={19} /></button>}
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${isAdmin ? 'bg-[#f2e8f0] font-serif text-sm text-[#684768]' : 'bg-[#401d3c] text-white'}`}>{isAdmin ? initials(otherName) : <FiMessageCircle size={18} />}</span>
                  <span className="min-w-0"><span className="block truncate text-[13px] font-semibold">{isAdmin ? otherName : 'Soni Saree Showroom'}</span><span className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[#8c828b]">{isAdmin ? <><span className="h-1.5 w-1.5 rounded-full bg-[#75a182]" /> {conversation?.user?.email || 'Customer conversation'}</> : <><FiShield size={11} className="text-[#a77d45]" /> Official showroom support</>}</span></span>
                </div>
                {isAdmin && conversation && <button type="button" onClick={() => void toggleConversationStatus()} className={`rounded-full border px-3 py-2 text-[10px] font-semibold transition sm:px-3.5 sm:text-[11px] ${conversation.status === 'open' ? 'border-[#ecdfd9] text-[#746873] hover:bg-[#f8f4f1]' : 'border-[#d7e8dc] bg-[#f3f9f5] text-[#397556] hover:bg-[#eaf4ed]'}`}>{conversation.status === 'open' ? 'Mark resolved' : 'Reopen chat'}</button>}
                {!isAdmin && <button type="button" aria-label="More chat information" className="grid h-9 w-9 place-items-center rounded-full text-[#928891] hover:bg-[#f5f1ed]"><FiMoreHorizontal size={20} /></button>}
              </div>

              <div ref={listRef} aria-live="polite" className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8 lg:px-12">
                {loadingHistory ? <div className="mx-auto mt-12 h-20 max-w-xs animate-pulse rounded-2xl bg-[#f0ebe6]" /> : <>
                  {hasOlderMessages && <div className="mb-5 flex justify-center"><button type="button" onClick={() => void loadOlderMessages()} disabled={loadingOlderMessages} className="rounded-full border border-[#e9e1dc] bg-white px-4 py-2 text-[10px] font-semibold text-[#776c75] transition hover:border-[#cbb4c8] hover:text-[#401d3c] disabled:opacity-50">{loadingOlderMessages ? 'Loading earlier messages…' : 'Load earlier messages'}</button></div>}
                  <div className="mx-auto mb-7 flex max-w-md items-center gap-3 text-[9px] font-medium tracking-[.12em] text-[#a69ca3]"><span className="h-px flex-1 bg-[#ece5df]" />PRIVATE SHOWROOM CHAT<span className="h-px flex-1 bg-[#ece5df]" /></div>
                  {!messages.length && <div className="mx-auto mb-7 max-w-[380px] rounded-2xl border border-[#eee6e0] bg-white px-5 py-4 text-center shadow-[0_4px_18px_rgba(43,26,42,0.035)]"><span className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-[#f5edf3] text-[#684768]"><FiMessageCircle size={16} /></span><p className="mt-2 text-xs font-semibold">{isAdmin ? `You’re chatting with ${otherName}` : 'How can we help you today?'}</p><p className="mt-1 text-[10px] leading-4 text-[#8d838b]">{isAdmin ? 'Reply with product details, stock updates, or order help.' : 'Ask us about styles, stock, delivery, or an existing order. Our team will reply here.'}</p></div>}
                  {messages.map((message, index) => {
                    const own = message.senderType === (isAdmin ? 'admin' : 'user');
                    const previous = messages[index - 1];
                    const showDay = !previous || formatDay(previous.createdAt) !== formatDay(message.createdAt);
                    return <div key={message.id}>
                      {showDay && <div className="my-5 flex justify-center"><span className="rounded-full border border-[#ebe4de] bg-white px-3 py-1 text-[9px] font-medium text-[#948a92]">{formatDay(message.createdAt)}</span></div>}
                      <div className={`mb-3 flex ${own ? 'justify-end' : 'justify-start'}`}>
                        {!own && <span className="mr-2 mt-auto grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e9dce7] font-serif text-[10px] text-[#684768]">{initials(isAdmin ? otherName : 'Soni')}</span>}
                        <div className={`max-w-[min(78%,560px)] px-4 py-3 shadow-[0_2px_8px_rgba(43,26,42,0.035)] ${own ? 'rounded-[18px] rounded-br-[5px] bg-[#401d3c] text-white' : 'rounded-[18px] rounded-bl-[5px] border border-[#eee7e2] bg-white text-[#3f3540]'}`}>
                          <p className="whitespace-pre-wrap break-words text-[13px] leading-[1.65]">{message.body}</p>
                          <span className={`mt-1.5 flex items-center justify-end gap-1 text-[9px] ${own ? 'text-white/55' : 'text-[#a39aa1]'}`}>{formatTime(message.createdAt)}{own && <FiCheck size={11} />}</span>
                        </div>
                      </div>
                    </div>;
                  })}
                  {notice && <p role="status" className="mx-auto my-4 max-w-lg rounded-xl border border-[#f0d9d6] bg-[#fff8f7] px-4 py-2 text-center text-[11px] text-[#a13d39]">{notice}</p>}
                </>}
              </div>

              <div className="shrink-0 border-t border-[#eee8e3] bg-white px-3 pb-[max(14px,env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pb-5 sm:pt-4">
                {conversation?.status === 'closed' && !isAdmin && <p className="mx-auto mb-2 max-w-3xl text-center text-[10px] text-[#8b8189]">This chat was marked resolved. Sending a message will reopen it.</p>}
                <form onSubmit={sendMessage} className="mx-auto max-w-3xl">
                  <div className="flex items-end gap-2 rounded-[18px] border border-[#e9e1dc] bg-[#fcfbf9] p-2 pl-4 shadow-[0_3px_14px_rgba(43,26,42,0.035)] transition focus-within:border-[#cbb4c8] focus-within:bg-white focus-within:shadow-[0_6px_22px_rgba(64,29,60,0.08)]">
                    <textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={handleComposerKey} rows={1} maxLength={2000} placeholder={isAdmin ? `Reply to ${otherName}…` : 'Write your message…'} aria-label="Write your message" className="max-h-32 min-h-10 flex-1 resize-y bg-transparent py-2.5 text-[13px] leading-5 text-[#352d35] outline-none placeholder:text-[#aaa0a7]" />
                    <button type="submit" disabled={!draft.trim() || sending || !selectedId && isAdmin} aria-label="Send message" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#401d3c] text-white transition hover:bg-[#32162f] disabled:cursor-not-allowed disabled:bg-[#d9d0d7]"><FiSend size={16} /></button>
                  </div>
                  <div className="mt-2 flex items-center justify-between px-1 text-[9px] text-[#a39aa1]"><span>{connection === 'online' ? 'Messages are delivered instantly' : 'Messages will send when you’re connected'}</span><span>{draft.length}/2000</span></div>
                </form>
              </div>
            </> : <div className="hidden flex-1 flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,_#fff_0%,_#fbf8f5_70%)] px-8 text-center md:flex">
              <span className="grid h-[74px] w-[74px] place-items-center rounded-[24px] bg-[#f3ebf2] text-[#684768] shadow-sm"><FiMessageCircle size={30} strokeWidth={1.4} /></span>
              <p className="mt-6 text-[9px] font-bold tracking-[.24em] text-[#a77d45]">THE SHOWROOM INBOX</p>
              <h2 className="mt-2 font-serif text-[30px]">Every conversation, in one place</h2>
              <p className="mt-2 max-w-sm text-[12px] leading-5 text-[#8b8189]">Choose a customer from the inbox to view their messages and reply about products, stock, or orders.</p>
              <div className="mt-8 flex items-center gap-3 rounded-full border border-[#eee8e3] bg-white px-4 py-2.5 text-[10px] text-[#817781]"><FiShoppingBag className="text-[#a77d45]" /> Personal support, thoughtfully delivered <FiPackage className="text-[#a77d45]" /></div>
            </div>}
          </section>
        </div>
      </section>
    </main>
  );
}
