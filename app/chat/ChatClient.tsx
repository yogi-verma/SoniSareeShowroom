'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { FiArrowLeft, FiArrowUpRight, FiCheckCircle, FiChevronLeft, FiClock, FiHash, FiMail, FiMessageCircle, FiPackage, FiSearch, FiSend, FiTag, FiUser, FiVolume2 } from 'react-icons/fi';
import { useAuth } from '../components/Auth/AuthProvider';

const AUTH_API = (process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
const WS_URL = `${AUTH_API.replace(/^http/, 'ws')}/ws/chat`;

type ChatMessage = { id: string; conversationId: string; senderType: 'user' | 'admin'; senderId: string; body: string; createdAt: string; seenAt?: string | null };
type ChatPresence = { actorType: 'user' | 'admin'; actorId: string; status: 'online' | 'offline'; lastSeenAt: string | null };
type Conversation = {
  id: string;
  user?: { id: string; name: string; email: string; picture?: string };
  status: 'open' | 'closed';
  lastMessage: string;
  lastMessageAt: string;
  lastMessageBy: 'user' | 'admin';
  unreadByAdmin: number;
  unreadByUser?: number;
  userPresence?: ChatPresence | null;
};
type InboxFilter = 'all' | 'unread' | 'open' | 'resolved';

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
function formatLastSeen(value?: string | null) {
  if (!value) return 'Offline';
  const date = new Date(value);
  const formatted = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }).format(date);
  return `Last seen ${formatted} IST`;
}
function playChatTone(context: AudioContext | null, kind: 'sent' | 'received') {
  if (!context || context.state !== 'running') return;
  const notes = kind === 'sent' ? [740, 990] : [660, 880, 1046, 880];
  const start = context.currentTime + 0.015;
  notes.forEach((frequency, index) => {
    const at = start + index * (kind === 'sent' ? 0.1 : 0.16);
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, at);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.12, at + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + (kind === 'sent' ? 0.075 : 0.12));
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(at);
    oscillator.stop(at + (kind === 'sent' ? 0.08 : 0.13));
  });
}

function MessageTicks({ seen }: { seen: boolean }) {
  return <svg aria-label={seen ? 'Seen' : 'Sent'} role="img" viewBox="0 0 18 13" className={`h-[12px] w-[17px] ${seen ? 'text-[#55b8df]' : 'text-white/55'}`} fill="none">
    <path d="m1.5 6.7 3.1 3.1 6-6.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="m6.2 6.7 3.1 3.1 7-7.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
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
  const [peerPresence, setPeerPresence] = useState<ChatPresence | null>(null);
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [inboxFilter, setInboxFilter] = useState<InboxFilter>('all');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [connection, setConnection] = useState<'connecting' | 'online' | 'offline'>('connecting');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [notice, setNotice] = useState('');
  const [mobileInbox, setMobileInbox] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const preservedScrollRef = useRef<{ height: number; top: number } | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const handledMessageIdsRef = useRef(new Set<string>());
  const selectedConversationRef = useRef(selectedId);
  const peerUserIdRef = useRef<string | null>(null);
  const isAdminRef = useRef(isAdmin);

  useEffect(() => { isAdminRef.current = isAdmin; }, [isAdmin]);
  useEffect(() => { selectedConversationRef.current = selectedId; }, [selectedId]);
  useEffect(() => {
    peerUserIdRef.current = isAdmin ? conversation?.user?.id || conversations.find((item) => item.id === selectedId)?.user?.id || null : null;
  }, [conversation, conversations, isAdmin, selectedId]);

  const enableSound = useCallback(() => {
    if (typeof window === 'undefined' || !window.AudioContext) return;
    if (!audioContextRef.current) audioContextRef.current = new window.AudioContext();
    const context = audioContextRef.current;
    if (context.state === 'suspended') {
      void context.resume().then(() => setSoundEnabled(context.state === 'running')).catch(() => {});
    } else setSoundEnabled(true);
  }, []);

  useEffect(() => {
    window.addEventListener('pointerdown', enableSound);
    window.addEventListener('keydown', enableSound);
    return () => {
      window.removeEventListener('pointerdown', enableSound);
      window.removeEventListener('keydown', enableSound);
      void audioContextRef.current?.close();
      audioContextRef.current = null;
    };
  }, [enableSound]);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
    setConversation((current) => current ? { ...current, lastMessage: message.body, lastMessageAt: message.createdAt, lastMessageBy: message.senderType } : current);
    setConversation((current) => current || (!isAdminRef.current ? { id: message.conversationId, status: 'open', lastMessage: message.body, lastMessageAt: message.createdAt, lastMessageBy: message.senderType, unreadByAdmin: 0, unreadByUser: 0 } : current));
    setConversations((current) => current.map((item) => item.id === message.conversationId ? {
      ...item, lastMessage: message.body, lastMessageAt: message.createdAt, lastMessageBy: message.senderType,
      unreadByAdmin: isAdminRef.current && message.senderType === 'user' && item.id !== selectedId ? item.unreadByAdmin + 1 : item.unreadByAdmin,
    } : item).sort((a, b) => +new Date(b.lastMessageAt) - +new Date(a.lastMessageAt)));
  }, [selectedId]);

  const handleNewMessage = useCallback((message: ChatMessage) => {
    if (handledMessageIdsRef.current.has(message.id)) return;
    handledMessageIdsRef.current.add(message.id);
    const ownType = isAdminRef.current ? 'admin' : 'user';
    const ownMessage = message.senderType === ownType;
    playChatTone(audioContextRef.current, ownMessage ? 'sent' : 'received');
    addMessage(message);
    const isActiveConversation = isAdminRef.current
      ? selectedConversationRef.current === message.conversationId
      : true;
    if (!ownMessage && isActiveConversation && document.visibilityState === 'visible' && socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'seen', ...(isAdminRef.current ? { conversationId: message.conversationId } : {}) }));
    }
  }, [addMessage]);

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
        if (!selectedId) {
          setConversation(null); setPeerPresence(null); handledMessageIdsRef.current.clear();
          setMessages((current) => current.filter((message) => !message.conversationId));
          setLoadingHistory(false); return;
        }
        response = await fetch(`/api/chat/admin/conversations/${encodeURIComponent(selectedId)}/messages?limit=50`, { cache: 'no-store' });
      } else if (user) {
        response = await fetch(`${AUTH_API}/api/chat/me?limit=50`, { credentials: 'include', cache: 'no-store' });
      } else {
        setConversation(null); setPeerPresence(null); setHasOlderMessages(false); setOlderMessageCursor(null);
        handledMessageIdsRef.current = new Set();
        setMessages((current) => current.filter((message) => Boolean(message.conversationId)));
        setLoadingHistory(false); return;
      }
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || 'Could not load chat history.');
      if (!active) return;
      const loadedConversation = isAdmin
        ? {
            ...result.conversation,
            id: result.conversation?.id || selectedId,
            user: result.conversation?.userId && typeof result.conversation.userId === 'object'
              ? { ...result.conversation.userId, id: String(result.conversation.userId.id || result.conversation.userId._id) }
              : result.conversation?.user
          }
        : result.conversation;
      setConversation(loadedConversation || null);
      if (isAdmin && selectedId) setConversations((current) => current.map((item) => item.id === selectedId ? { ...item, unreadByAdmin: 0 } : item));
      const loadedMessages = result.messages || [];
      const loadedConversationId = String(loadedConversation?.id || loadedConversation?._id || '');
      setMessages((current) => {
        const combined = new Map<string, ChatMessage>();
        for (const message of loadedMessages) combined.set(message.id, message);
        for (const message of current) if (message.conversationId === loadedConversationId) combined.set(message.id, message);
        return [...combined.values()].sort((left, right) => +new Date(left.createdAt) - +new Date(right.createdAt));
      });
      for (const message of loadedMessages) handledMessageIdsRef.current.add(message.id);
      setHasOlderMessages(Boolean(result.pagination?.hasMore));
      setOlderMessageCursor(result.pagination?.nextBefore || null);
      setPeerPresence(isAdmin ? result.presence?.user || null : result.presence?.admin || null);
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
          if (selectedId) url += `&conversationId=${encodeURIComponent(selectedId)}`;
        }
        if (!active) return;
        currentSocket = new WebSocket(url);
        socketRef.current = currentSocket;
        currentSocket.onopen = () => { retryDelay = 800; setConnection('online'); };
        currentSocket.onmessage = (event) => {
          try {
            const payload = JSON.parse(String(event.data)) as {
              type: string; message?: ChatMessage | string; conversationId?: string; seenAt?: string;
              presence?: ChatPresence; seenBy?: 'user' | 'admin';
            };
            if (payload.type === 'message' && payload.message && typeof payload.message !== 'string') {
              const message = payload.message;
              handleNewMessage(message);
              if (isAdminRef.current && selectedConversationRef.current === message.conversationId) {
                setConversations((current) => current.map((item) => item.id === message.conversationId ? { ...item, unreadByAdmin: 0 } : item));
              }
              if (isAdminRef.current) void reloadInbox().catch((error: Error) => setNotice(error.message));
            }
            if (payload.type === 'seen' && payload.conversationId && payload.seenAt) {
              const ownType = isAdminRef.current ? 'admin' : 'user';
              setMessages((current) => current.map((message) => message.conversationId === payload.conversationId && message.senderType === ownType ? { ...message, seenAt: payload.seenAt } : message));
            }
            if (payload.type === 'presence' && payload.presence) {
              const presence = payload.presence;
              if (isAdminRef.current && presence.actorType === 'user') {
                setConversations((current) => current.map((item) => item.user?.id === presence.actorId ? { ...item, userPresence: presence } : item));
                if (peerUserIdRef.current === presence.actorId) setPeerPresence(presence);
              } else if (!isAdminRef.current && presence.actorType === 'admin') setPeerPresence(presence);
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
  }, [handleNewMessage, isAdmin, isAdminVerified, isLoading, reloadInbox, selectedId, user]);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const frame = window.requestAnimationFrame(() => {
      if (preservedScrollRef.current) {
        const previous = preservedScrollRef.current;
        list.scrollTop = previous.top + (list.scrollHeight - previous.height);
        preservedScrollRef.current = null;
        return;
      }
      list.scrollTop = list.scrollHeight;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [loadingHistory, messages, selectedId]);

  const visibleConversations = useMemo(() => conversations.filter((item) => {
    const matchesSearch = `${item.user?.name || ''} ${item.user?.email || ''} ${item.lastMessage}`.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = inboxFilter === 'all'
      || (inboxFilter === 'unread' && item.unreadByAdmin > 0)
      || (inboxFilter === 'open' && item.status === 'open')
      || (inboxFilter === 'resolved' && item.status === 'closed');
    return matchesSearch && matchesFilter;
  }), [conversations, inboxFilter, search]);
  const unreadCount = conversations.reduce((sum, item) => sum + item.unreadByAdmin, 0);
  const openCount = conversations.filter((item) => item.status === 'open').length;
  const resolvedCount = conversations.length - openCount;
  const otherName = isAdmin ? conversation?.user?.name || conversations.find((item) => item.id === selectedId)?.user?.name || 'Customer' : adminName;
  const presenceLabel = peerPresence?.status === 'online' ? 'Online' : formatLastSeen(peerPresence?.lastSeenAt);
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
    <main className={`${isAdmin ? 'min-h-screen bg-[#f1eff3] p-0 sm:p-4 lg:p-6' : 'min-h-screen bg-[#f7f3f6] pb-0 sm:px-6 sm:pb-6'} text-[#292431]`}>
      {!isAdmin && <header className="sticky top-0 z-20 flex h-[76px] items-center gap-3 border-b border-[#eee7ec] bg-white/95 px-5 rounded-[22px] mt-1 backdrop-blur">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Soni Saree Showroom home"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#532a50] font-serif text-xl text-white">❋</span><span><span className="block font-serif text-[17px] leading-3 text-[#342735]">Soni Saree</span><span className="text-[9px] font-semibold uppercase tracking-[.2em] text-[#9b7955]">Showroom</span></span></Link>
        <nav aria-label="Main navigation" className="ml-auto flex shrink-0 items-center gap-2 sm:gap-6">{[['Home', '/'], ['Collection', '/categories'], ['Profile', user?.email ? `/me/${encodeURIComponent(user.email)}` : '/']].map(([label, href]) => <Link key={label} href={href} onClick={label === 'Profile' && !user ? (event) => { event.preventDefault(); openSignIn(); } : undefined} className="group relative py-2 text-[11px] font-medium text-[#756b75] transition-colors hover:text-[#532a50] after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-[#532a50] after:transition-transform after:duration-300 after:content-[''] hover:after:origin-left hover:after:scale-x-100 sm:text-[13px]">{label}</Link>)}</nav>
      </header>}
      <section className={`mx-auto flex ${isAdmin ? 'h-[100dvh] max-w-[1500px] sm:h-[calc(100dvh-32px)] lg:h-[calc(100dvh-48px)]' : 'h-[calc(100dvh-76px)] max-w-[1600px] sm:h-[calc(100dvh-108px)] sm:overflow-hidden sm:rounded-[22px] sm:border sm:border-[#eadfe8]'} flex-col overflow-hidden bg-white shadow-[0_24px_80px_rgba(45,31,52,0.13)] ${isAdmin ? 'sm:rounded-[22px] sm:border sm:border-[#e9e5eb]' : ''}`}>
        {isAdmin && <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#eeebf0] bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            {isAdmin ? <Link href="/admin/sonisaree" aria-label="Back to admin dashboard" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#e9e5eb] text-[#625b69] transition hover:border-[#d8cbdc] hover:bg-[#faf7fb]"><FiArrowLeft size={17} /></Link> : <Link href="/" aria-label="Back to showroom" className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-[#532a50] font-serif text-xl text-white shadow-[0_5px_14px_rgba(83,42,80,0.22)]">❋</Link>}
            <div className="min-w-0">
              <p className="truncate text-[9px] font-bold uppercase tracking-[.18em] text-[#a17b50]">{isAdmin ? 'Showroom workspace' : 'Soni Saree Showroom'}</p>
              <h1 className="truncate font-serif text-[18px] leading-6 text-[#2d2632] sm:text-[20px]">{isAdmin ? 'Customer inbox' : 'We’re here to help'}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {!soundEnabled && <button type="button" onClick={enableSound} title="Enable message sounds" className="grid h-9 w-9 place-items-center rounded-xl border border-[#e9e5eb] text-[#716778] transition hover:border-[#d8cbdc] hover:bg-[#faf7fb] sm:flex sm:w-auto sm:gap-2 sm:px-3"><FiVolume2 size={15} /><span className="hidden text-[10px] font-semibold sm:inline">Sound</span></button>}
            {/* <span className={`inline-flex h-9 items-center gap-2 rounded-xl px-3 text-[10px] font-semibold ${connection === 'online' ? 'bg-[#eef7f1] text-[#397556]' : 'bg-[#f4f2f5] text-[#817985]'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${connection === 'online' ? 'bg-[#65a77b]' : 'bg-[#aaa2ad]'}`} />{connection === 'online' ? 'Connected' : connection === 'connecting' ? 'Connecting' : 'Reconnecting'}
            </span> */}
            {!isAdmin && <Link href="/categories" className="hidden h-9 items-center gap-2 rounded-xl border border-[#e9e5eb] px-3 text-[10px] font-semibold text-[#625b69] transition hover:bg-[#faf7fb] sm:flex">Explore collection <FiArrowUpRight size={13} /></Link>}
            {isAdmin && <span title={adminName} className="grid h-9 w-9 place-items-center rounded-xl bg-[#f1eaf2] font-serif text-sm font-semibold text-[#684768]">{initials(adminName)}</span>}
          </div>
        </header>}

        <div className="flex min-h-0 flex-1">
          {isAdmin && (
            <aside className={`${mobileInbox && selectedId ? 'flex' : selectedId ? 'hidden' : 'flex'} w-full shrink-0 flex-col border-r border-[#ece9ee] bg-[#faf9fb] md:flex md:w-[340px] lg:w-[370px]`}>
              <div className="px-4 pb-4 pt-5 sm:px-5">
                <div className="flex items-center justify-between">
                  <div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-[#9a7652]">Support inbox</p><h2 className="mt-1 font-serif text-[24px] leading-7 text-[#2d2632]">Messages</h2></div>
                  <span className="grid h-9 min-w-9 place-items-center rounded-xl bg-[#eee7f0] px-2 text-[11px] font-bold text-[#684768]">{conversations.length}</span>
                </div>
                <label className="mt-4 flex h-10 items-center gap-2.5 rounded-xl border border-[#e9e5eb] bg-white px-3 text-[#948d99] shadow-[0_1px_2px_rgba(45,31,52,0.025)] transition focus-within:border-[#b99cbe] focus-within:ring-2 focus-within:ring-[#eee5f0]"><FiSearch size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customers" className="min-w-0 flex-1 bg-transparent text-[11px] text-[#352d35] outline-none placeholder:text-[#aaa4ad]" />{search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search" className="text-[10px] text-[#958d99] hover:text-[#532a50]">Clear</button>}</label>
                <div className="mt-3 flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {([
                    ['all', 'All', conversations.length],
                    ['unread', 'Unread', unreadCount],
                    ['open', 'Open', openCount],
                    ['resolved', 'Resolved', resolvedCount],
                  ] as const).map(([filter, label, count]) => <button type="button" key={filter} onClick={() => setInboxFilter(filter)} className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-[10px] font-semibold transition ${inboxFilter === filter ? 'bg-[#532a50] text-white shadow-sm' : 'text-[#77717d] hover:bg-[#efedf1] hover:text-[#3e3343]'}`}>{label}<span className={`${inboxFilter === filter ? 'text-white/65' : 'text-[#a7a0aa]'}`}>{count}</span></button>)}
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto border-t border-[#efedf1] px-2 py-2">
                {visibleConversations.length ? visibleConversations.map((item) => {
                  const active = selectedId === item.id;
                  return <button type="button" key={item.id} onClick={() => openConversation(item.id)} className={`mb-1 flex w-full items-start gap-3 rounded-2xl p-3.5 text-left transition ${active ? 'bg-[#efe8f1] ring-1 ring-inset ring-[#e8dce9]' : 'hover:bg-[#f1eff3]'}`}>
                    <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#e9dfea] font-serif text-[13px] font-semibold text-[#684768]">{item.user?.picture ? <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.user.picture} alt="" className="h-full w-full object-cover" />
                    </> : initials(item.user?.name)}<i className={`absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-xl border-2 border-white ${item.userPresence?.status === 'online' ? 'bg-[#63a279]' : 'bg-[#c4bec8]'}`} /></span>
                    <span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="truncate text-[13px] font-semibold text-[#342d39]">{item.user?.name || 'Customer'}</span><span className="shrink-0 text-[10px] text-[#98919c]">{formatDay(item.lastMessageAt)}</span></span><span className="mt-2 flex items-center justify-between gap-2"><span className="truncate text-[12px] text-[#6f6875]">{item.lastMessageBy === 'admin' && <span className="font-semibold text-[#837b88]">You: </span>}{item.lastMessage || 'Started a conversation'}</span>{item.unreadByAdmin > 0 && <span className="grid h-[19px] min-w-[19px] shrink-0 place-items-center rounded-md bg-[#532a50] px-1 text-[9px] font-bold text-white">{item.unreadByAdmin}</span>}</span></span>
                  </button>;
                }) : <div className="mx-3 mt-8 rounded-2xl border border-dashed border-[#ddd6e0] bg-white/70 px-5 py-8 text-center"><span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-[#f0ebf2] text-[#684768]"><FiMessageCircle size={18} /></span><p className="mt-3 text-[11px] font-semibold text-[#514650]">{search || inboxFilter !== 'all' ? 'No conversations found' : 'Your inbox is ready'}</p><p className="mt-1 text-[10px] leading-4 text-[#918a95]">{search || inboxFilter !== 'all' ? 'Try another search or filter.' : 'Customer messages will appear here.'}</p></div>}
              </div>
              <div className="flex items-center gap-2 border-t border-[#ece9ee] px-4 py-3 text-[10px] text-[#8a838e]"><span className="h-1.5 w-1.5 rounded-full bg-[#64a47a]" />{unreadCount} unread {unreadCount === 1 ? 'message' : 'messages'}<span className="ml-auto">{conversations.length} total</span></div>
            </aside>
          )}

          <section className={`${isAdmin && (!selectedId || mobileInbox) ? 'hidden md:flex' : 'flex'} min-w-0 flex-1 flex-col bg-[#f7f7f9]`}>
            {(!isAdmin || selectedId) ? <div className="flex min-h-0 flex-1">
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex h-[78px] shrink-0 items-center justify-between border-b border-[#ece9ee] bg-white px-4 sm:px-6">
                  <div className="flex min-w-0 items-center gap-3">
                    {isAdmin && <button type="button" onClick={() => setMobileInbox(true)} aria-label="Back to conversations" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[#766d79] transition hover:bg-[#f1eff3] md:hidden"><FiChevronLeft size={19} /></button>}
                    <span className={`relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl ${isAdmin ? 'bg-[#eee5f0] font-serif text-sm font-semibold text-[#684768]' : 'bg-[#532a50] text-white'}`}>{isAdmin ? initials(otherName) : <FiMessageCircle size={18} />}{peerPresence?.status === 'online' && <i className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#63a279]" />}</span>
                    <div className="min-w-0"><h2 className="truncate text-[14px] font-semibold text-[#332c38]">{isAdmin ? otherName : 'Soni Saree Showroom'}</h2><p className="mt-0.5 truncate text-[11px] text-[#89828d]">{isAdmin ? `${conversation?.user?.email || 'Customer conversation'} · ${presenceLabel}` : `Showroom support · ${presenceLabel}`}</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[9px] font-semibold sm:inline-flex ${conversation?.status === 'closed' ? 'bg-[#f1eff3] text-[#807987]' : 'bg-[#eef7f1] text-[#397556]'}`}><span className={`h-1.5 w-1.5 rounded-full ${conversation?.status === 'closed' ? 'bg-[#aaa3ae]' : 'bg-[#63a279]'}`} />{conversation?.status === 'closed' ? 'Resolved' : 'Active chat'}</span>
                    {isAdmin && conversation && <button type="button" onClick={() => void toggleConversationStatus()} className={`h-8 rounded-lg border px-2.5 text-[9px] font-semibold transition sm:h-9 sm:px-3 sm:text-[10px] ${conversation.status === 'open' ? 'border-[#e5dfe7] bg-white text-[#716879] hover:bg-[#faf8fb]' : 'border-[#d7e8dc] bg-[#f2f8f4] text-[#397556] hover:bg-[#e9f4ed]'}`}>{conversation.status === 'open' ? 'Resolve' : 'Reopen'}</button>}
                  </div>
                </div>

                <div ref={listRef} aria-live="polite" className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_#fbfafc_0%,_#f5f5f7_75%)] px-4 py-5 sm:px-8 sm:py-7 lg:px-12">
                  {loadingHistory ? <div className="mx-auto mt-12 h-20 max-w-xs animate-pulse rounded-2xl bg-[#ebe9ee]" /> : <>
                    {hasOlderMessages && <div className="mb-5 flex justify-center"><button type="button" onClick={() => void loadOlderMessages()} disabled={loadingOlderMessages} className="rounded-lg border border-[#e5e1e8] bg-white px-3.5 py-2 text-[10px] font-semibold text-[#716879] shadow-[0_2px_5px_rgba(45,31,52,0.04)] transition hover:border-[#cbb8cf] hover:text-[#532a50] disabled:opacity-50">{loadingOlderMessages ? 'Loading earlier messages…' : 'Load earlier messages'}</button></div>}
                    <div className="mx-auto mb-7 flex max-w-md items-center gap-3 text-[9px] font-semibold tracking-[.14em] text-[#aaa4ad]"><span className="h-px flex-1 bg-[#e7e4e9]" />{messages.length ? formatDay(messages[0]?.createdAt) : 'YOUR PRIVATE CHAT'}<span className="h-px flex-1 bg-[#e7e4e9]" /></div>
                    {!messages.length && <div className="mx-auto mb-8 max-w-[470px] rounded-2xl border border-[#ebe7ee] bg-white p-5 text-center shadow-[0_8px_30px_rgba(50,36,58,0.045)] sm:p-7"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#f2ebf3] text-[#684768]"><FiMessageCircle size={21} /></span><p className="mt-4 text-[9px] font-bold uppercase tracking-[.18em] text-[#9a7652]">{isAdmin ? 'Customer conversation' : 'Personal showroom support'}</p><h3 className="mt-1 font-serif text-[22px] text-[#312a36]">{isAdmin ? `You’re speaking with ${otherName}` : 'How can we help you today?'}</h3><p className="mx-auto mt-2 max-w-sm text-[11px] leading-5 text-[#817a86]">{isAdmin ? 'A thoughtful reply goes a long way. Help with product details, stock, delivery, or an order.' : 'Ask about a saree, check what’s in stock, or get help with delivery and orders.'}</p>
                      {!isAdmin && <div className="mt-5 flex flex-wrap justify-center gap-2">{['Check product availability', 'Track my order', 'Need styling advice'].map((prompt) => <button type="button" key={prompt} onClick={() => setDraft(prompt)} className="rounded-lg border border-[#ebe6ed] bg-[#fcfbfd] px-3 py-2 text-[10px] font-medium text-[#655b6a] transition hover:border-[#cdb9d1] hover:bg-[#f6f1f7]">{prompt}</button>)}</div>}
                    </div>}
                    <div className="mx-auto max-w-[860px]">
                      {messages.map((message, index) => {
                        const own = message.senderType === (isAdmin ? 'admin' : 'user');
                        const previous = messages[index - 1];
                        const showDay = !previous || formatDay(previous.createdAt) !== formatDay(message.createdAt);
                        return <div key={message.id}>
                          {showDay && messages.length > 1 && <div className="my-5 flex justify-center"><span className="rounded-lg border border-[#e8e4ea] bg-white/85 px-3 py-1 text-[9px] font-medium text-[#8b8490]">{formatDay(message.createdAt)}</span></div>}
                          <div className={`mb-3.5 flex ${own ? 'justify-end' : 'justify-start'}`}>
                            {!own && <span className="mr-2 mt-auto grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#e9e0eb] font-serif text-[9px] font-semibold text-[#684768]">{initials(isAdmin ? otherName : 'Soni')}</span>}
                            <div className={`max-w-[min(82%,560px)] px-4 py-3 ${own ? 'rounded-[16px] rounded-br-[5px] bg-[#532a50] text-white shadow-[0_4px_12px_rgba(83,42,80,0.14)]' : 'rounded-[16px] rounded-bl-[5px] border border-[#e9e5eb] bg-white text-[#37313d] shadow-[0_3px_10px_rgba(45,31,52,0.035)]'}`}>
                              <p className="whitespace-pre-wrap break-words text-[14px] leading-[1.7]">{message.body}</p>
                              <span className={`mt-1.5 flex items-center justify-end gap-1 text-[9px] ${own ? 'text-white/60' : 'text-[#9a939e]'}`}>{formatTime(message.createdAt)}{own && <MessageTicks seen={Boolean(message.seenAt)} />}</span>
                            </div>
                          </div>
                        </div>;
                      })}
                    </div>
                    {notice && <p role="status" className="mx-auto my-4 max-w-lg rounded-xl border border-[#efd9d7] bg-[#fff8f7] px-4 py-2.5 text-center text-[10px] text-[#a13d39]">{notice}</p>}
                  </>}
                </div>

                <div className="shrink-0 border-t border-[#ece9ee] bg-white px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pb-4 sm:pt-4">
                  {conversation?.status === 'closed' && !isAdmin && <p className="mx-auto mb-2 max-w-3xl text-center text-[9px] text-[#89828d]">This chat was marked resolved. Your message will reopen it.</p>}
                  <form onSubmit={sendMessage} className="mx-auto max-w-[860px]">
                    <div className="flex items-end gap-2 rounded-[14px] border border-[#e4e0e7] bg-[#fbfafc] p-2 pl-4 shadow-[0_4px_16px_rgba(45,31,52,0.045)] transition focus-within:border-[#b99cbe] focus-within:bg-white focus-within:shadow-[0_5px_18px_rgba(83,42,80,0.08)]">
                      <textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={handleComposerKey} rows={1} maxLength={2000} placeholder={isAdmin ? `Reply to ${otherName}…` : 'Write a message…'} aria-label="Write your message" className="max-h-32 min-h-10 flex-1 resize-y bg-transparent py-2.5 text-[12px] leading-5 text-[#352d35] outline-none placeholder:text-[#a49da8]" />
                      <button type="submit" disabled={!draft.trim() || sending || !selectedId && isAdmin} aria-label="Send message" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#532a50] text-white transition hover:bg-[#43203f] disabled:cursor-not-allowed disabled:bg-[#d9d4dc]"><FiSend size={15} /></button>
                    </div>
                    <div className="mt-2 flex items-center justify-between px-1 text-[9px] text-[#9b949e]"><span>{connection === 'online' ? 'Connected · your messages are private' : 'Reconnecting · messages will send when online'}</span><span>{draft.length}/2000</span></div>
                  </form>
                </div>
              </div>

              {isAdmin && selectedId && <aside className="hidden w-[270px] shrink-0 flex-col border-l border-[#ece9ee] bg-white xl:flex">
                <div className="border-b border-[#efedf1] px-5 py-5"><p className="text-[9px] font-bold uppercase tracking-[.16em] text-[#9a7652]">Customer details</p><div className="mt-4 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#eee5f0] font-serif text-[14px] font-semibold text-[#684768]">{initials(otherName)}</span><span className="min-w-0"><span className="block truncate text-[12px] font-semibold text-[#332c38]">{otherName}</span><span className="mt-0.5 block truncate text-[10px] text-[#8b8490]">{conversation?.user?.email || 'Showroom customer'}</span></span></div><span className={`mt-4 inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[9px] font-semibold ${peerPresence?.status === 'online' ? 'bg-[#eef7f1] text-[#397556]' : 'bg-[#f4f2f5] text-[#807987]'}`}><span className={`h-1.5 w-1.5 rounded-full ${peerPresence?.status === 'online' ? 'bg-[#63a279]' : 'bg-[#b6afb9]'}`} />{peerPresence?.status === 'online' ? 'Online now' : formatLastSeen(peerPresence?.lastSeenAt)}</span></div>
                <div className="space-y-5 p-5">
                  <div><p className="text-[9px] font-bold uppercase tracking-[.14em] text-[#9b949f]">Conversation</p><div className="mt-3 flex items-center justify-between rounded-xl border border-[#eeebf0] bg-[#fbfafc] px-3 py-3"><span className="flex items-center gap-2 text-[10px] text-[#706977]"><FiCheckCircle size={14} />Status</span><span className={`rounded-md px-2 py-1 text-[9px] font-semibold ${conversation?.status === 'closed' ? 'bg-[#eeecf0] text-[#77717d]' : 'bg-[#eaf5ed] text-[#397556]'}`}>{conversation?.status === 'closed' ? 'Resolved' : 'Open'}</span></div><div className="mt-2 flex items-center justify-between px-1 text-[10px] text-[#837c88]"><span className="flex items-center gap-2"><FiHash size={13} />Reference</span><span className="font-mono text-[9px]">{selectedId.slice(-7).toUpperCase()}</span></div></div>
                  <div><p className="text-[9px] font-bold uppercase tracking-[.14em] text-[#9b949f]">Common topics</p><div className="mt-3 space-y-2"><div className="flex items-center gap-2.5 rounded-xl bg-[#faf9fb] px-3 py-2.5 text-[10px] text-[#625b69]"><FiTag size={13} className="text-[#99759e]" />Product & stock</div><div className="flex items-center gap-2.5 rounded-xl bg-[#faf9fb] px-3 py-2.5 text-[10px] text-[#625b69]"><FiPackage size={13} className="text-[#99759e]" />Orders & delivery</div><div className="flex items-center gap-2.5 rounded-xl bg-[#faf9fb] px-3 py-2.5 text-[10px] text-[#625b69]"><FiClock size={13} className="text-[#99759e]" />Customer support</div></div></div>
                  <div className="rounded-xl bg-[#f5f0f6] p-3.5"><p className="text-[10px] font-semibold text-[#514650]">Quick reply</p><p className="mt-1 text-[9px] leading-4 text-[#827987]">Choose a helpful opener to get back to this customer.</p><button type="button" onClick={() => setDraft('Thanks for reaching out. I’ll check that for you and get back shortly.')} className="mt-3 w-full rounded-lg border border-[#e4d9e7] bg-white px-3 py-2 text-left text-[9px] leading-4 text-[#655b6a] transition hover:border-[#cdb9d1]">“I’ll check that for you…”</button><button type="button" onClick={() => setDraft('Thanks for your patience. I’m checking the latest stock availability now.')} className="mt-2 w-full rounded-lg border border-[#e4d9e7] bg-white px-3 py-2 text-left text-[9px] leading-4 text-[#655b6a] transition hover:border-[#cdb9d1]">“Checking stock availability…”</button></div>
                </div>
              </aside>}
            </div> : <div className="hidden flex-1 flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,_#fff_0%,_#faf9fb_72%)] px-8 text-center md:flex">
              <span className="grid h-[68px] w-[68px] place-items-center rounded-[20px] bg-[#f0e9f2] text-[#684768]"><FiMessageCircle size={27} strokeWidth={1.5} /></span>
              <p className="mt-5 text-[9px] font-bold uppercase tracking-[.2em] text-[#9a7652]">Showroom support</p><h2 className="mt-2 font-serif text-[28px] text-[#302936]">A better kind of conversation</h2><p className="mt-2 max-w-sm text-[11px] leading-5 text-[#837c88]">Select a customer to see their message history and continue helping them with products, stock, or orders.</p>
              <div className="mt-7 flex flex-wrap justify-center gap-2"><span className="inline-flex items-center gap-2 rounded-lg border border-[#e9e5eb] bg-white px-3 py-2 text-[9px] text-[#746c79]"><FiUser size={12} className="text-[#99759e]" />Personal replies</span><span className="inline-flex items-center gap-2 rounded-lg border border-[#e9e5eb] bg-white px-3 py-2 text-[9px] text-[#746c79]"><FiMail size={12} className="text-[#99759e]" />Private inbox</span><span className="inline-flex items-center gap-2 rounded-lg border border-[#e9e5eb] bg-white px-3 py-2 text-[9px] text-[#746c79]"><FiPackage size={12} className="text-[#99759e]" />Order support</span></div>
            </div>}
          </section>
        </div>
      </section>
    </main>
  );
}
