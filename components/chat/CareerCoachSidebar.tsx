"use client";

import Link from "next/link";
import { Ellipsis, House, LoaderCircle, LogOut, PencilLine, Pin, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ChatSummary = {
  id: string;
  title: string;
  isPinned: boolean;
  updatedAt: string;
};

type ChatsResponse = {
  chats: ChatSummary[];
  nextCursor: string | null;
};

type CareerCoachSidebarProps = {
  activeChatId?: string;
};

function sortChats(chats: ChatSummary[]) {
  return [...chats].sort((first, second) => {
    const pinnedOrder = Number(second.isPinned) - Number(first.isPinned);
    if (pinnedOrder !== 0) return pinnedOrder;
    return Date.parse(second.updatedAt) - Date.parse(first.updatedAt);
  });
}

export function CareerCoachSidebar({ activeChatId }: CareerCoachSidebarProps) {
  const router = useRouter();
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [actionError, setActionError] = useState("");
  const [actionChatId, setActionChatId] = useState<string | null>(null);
  const [openMenuChatId, setOpenMenuChatId] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const cursorRef = useRef<string | null>(null);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialChats() {
      try {
        const response = await fetch("/api/chats?limit=20", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load chats");
        const result: ChatsResponse = await response.json();

        if (!cancelled) {
          setChats(result.chats);
          cursorRef.current = result.nextCursor;
          hasMoreRef.current = Boolean(result.nextCursor);
          setHasMore(Boolean(result.nextCursor));
        }
      } catch (error) {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : "Failed to load recent chats");
        console.error("Failed to load recent chats:", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadInitialChats();
    return () => {
      cancelled = true;
    };
  }, []);

  async function togglePin(chat: ChatSummary) {
    setActionChatId(chat.id);
    setActionError("");

    try {
      const response = await fetch(`/api/chats/${chat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !chat.isPinned }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Failed to update chat");

      setChats((currentChats) => sortChats(currentChats.map((currentChat) => currentChat.id === chat.id ? { ...currentChat, isPinned: !chat.isPinned } : currentChat)));
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to update chat");
    } finally {
      setActionChatId(null);
    }
  }

  async function deleteChat(chat: ChatSummary) {
    setActionChatId(chat.id);
    setActionError("");

    try {
      const response = await fetch(`/api/chats/${chat.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete chat");
      setChats((currentChats) => currentChats.filter((currentChat) => currentChat.id !== chat.id));
      if (chat.id === activeChatId) router.push("/chat");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to delete chat");
    } finally {
      setActionChatId(null);
    }
  }

  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;
    const scrollContainer = sidebar;

    async function loadMoreChats() {
      if (loadingRef.current || !hasMoreRef.current || !cursorRef.current) return;

      loadingRef.current = true;
      try {
        const response = await fetch(`/api/chats?limit=20&cursor=${encodeURIComponent(cursorRef.current)}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load more chats");
        const result: ChatsResponse = await response.json();

        setChats((currentChats) => {
          const existingIds = new Set(currentChats.map((chat) => chat.id));
          return [...currentChats, ...result.chats.filter((chat) => !existingIds.has(chat.id))];
        });
        cursorRef.current = result.nextCursor;
        hasMoreRef.current = Boolean(result.nextCursor);
        setHasMore(Boolean(result.nextCursor));
      } catch (error) {
        console.error("Failed to load more chats:", error);
      } finally {
        loadingRef.current = false;
      }
    }

    function handleScroll() {
      const distanceFromBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight;
      if (distanceFromBottom < 160) void loadMoreChats();
    }

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleChatCreated(event: Event) {
      const customEvent = event as CustomEvent<ChatSummary>;
      setChats((currentChats) => sortChats([
        customEvent.detail,
        ...currentChats.filter((chat) => chat.id !== customEvent.detail.id),
      ]));
    }

    window.addEventListener("career-chat-created", handleChatCreated);
    return () => window.removeEventListener("career-chat-created", handleChatCreated);
  }, []);

  useEffect(() => {
    function closeMenu(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("[data-chat-menu-trigger]") || target.closest("[data-chat-menu]")) return;
      setOpenMenuChatId(null);
    }

    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  return (
    <aside ref={sidebarRef} className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col overflow-y-auto border-r-2 border-[#d8e1dc] bg-[#f2f6f3] px-3 py-4 lg:flex">
      <div className="flex items-center justify-between px-2">
        <Link href="/" className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-[#e1ece5]"><span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#1f5a4d] text-[10px] font-bold text-white">AC</span><span className="text-sm font-semibold tracking-tight text-[#18332d]">Career Coach</span></Link>
        <Link href="/chat" aria-label="Start a new chat" className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-stone-500 hover:bg-[#e1ece5] hover:text-[#18332d]"><Plus size={17} strokeWidth={2.2} /></Link>
      </div>
      <Link href="/chat" className="mt-5 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#18332d] hover:bg-[#e1ece5]"><PencilLine size={16} strokeWidth={2} />New chat</Link>
      <div className="mt-7 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">Recents</div>
      {actionError ? <p className="mt-2 rounded-lg bg-[#fff0eb] px-3 py-2 text-[11px] leading-4 text-[#b96548]" role="alert">{actionError}</p> : null}
      <nav aria-label="Recent conversations" className="mt-2 space-y-1">
        {isLoading ? <div className="flex items-center gap-2 px-3 py-3 text-xs text-stone-400"><LoaderCircle size={14} className="animate-spin" />Loading conversations</div> : loadError ? <div className="rounded-lg bg-[#fff0eb] px-3 py-3 text-[11px] leading-4 text-[#b96548]" role="alert">{loadError}<button type="button" onClick={() => window.location.reload()} className="mt-2 block cursor-pointer font-semibold underline underline-offset-2">Try again</button></div> : chats.length ? chats.map((chat) => <div key={chat.id} className={`group relative flex items-center gap-1 rounded-lg border px-2 py-1 ${chat.id === activeChatId ? "border-[#c9ddd1] bg-[#e1eee6]" : "border-transparent hover:border-[#d8e1dc] hover:bg-[#e8efe9]"}`}>
          <Link href={`/chat/${chat.id}`} className={`flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 truncate py-1.5 text-left text-xs font-medium ${chat.id === activeChatId ? "text-[#1f5a4d]" : "text-stone-600 group-hover:text-[#18332d]"}`}>{chat.isPinned ? <Pin size={16} strokeWidth={2.4} fill="currentColor" aria-label="Pinned chat" /> : null}<span className="truncate">{chat.title}</span></Link>
          <button type="button" data-chat-menu-trigger aria-controls={`chat-menu-${chat.id}`} onClick={() => setOpenMenuChatId((currentId) => currentId === chat.id ? null : chat.id)} aria-label={`Actions for ${chat.title}`} aria-expanded={openMenuChatId === chat.id} className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-stone-400 transition hover:bg-white hover:text-[#18332d]"><Ellipsis size={16} /></button>
          {openMenuChatId === chat.id ? <div id={`chat-menu-${chat.id}`} data-chat-menu className="absolute right-1 top-9 z-30 w-36 rounded-xl border-2 border-[#d8e1dc] bg-white p-1.5 shadow-[0_10px_30px_rgba(24,51,45,0.14)]">
            <button type="button" onClick={() => { setOpenMenuChatId(null); void togglePin(chat); }} disabled={actionChatId === chat.id} className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-stone-600 hover:bg-[#eef5f0] hover:text-[#1f5a4d] disabled:opacity-50"><Pin size={14} fill={chat.isPinned ? "currentColor" : "none"} />{chat.isPinned ? "Unpin chat" : "Pin chat"}</button>
            <button type="button" onClick={() => { setOpenMenuChatId(null); void deleteChat(chat); }} disabled={actionChatId === chat.id} className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-stone-600 hover:bg-[#fff0eb] hover:text-[#b96548] disabled:opacity-50"><Trash2 size={14} />Delete chat</button>
          </div> : null}
        </div>) : <p className="px-3 py-3 text-xs text-stone-400">No conversations yet.</p>}
        {hasMore ? <div className="px-3 py-3 text-[11px] text-stone-400">Scroll for older chats</div> : null}
      </nav>
      <div className="mt-auto space-y-1 border-t-2 border-[#d8e1dc] pt-3"><Link href="/" className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-xs text-stone-600 hover:bg-[#e1ece5] hover:text-[#18332d]"><House size={15} strokeWidth={2} /><span>Home</span></Link><button type="button" onClick={() => void signOut()} className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs text-stone-600 hover:bg-[#e1ece5] hover:text-[#18332d]"><LogOut size={15} strokeWidth={2} /><span>Sign out</span></button><div className="rounded-lg px-3 py-2 text-[11px] leading-4 text-stone-400">Your conversations stay focused on your career goals.</div></div>
    </aside>
  );
}
