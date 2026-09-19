import Link from "next/link";
import { House, PencilLine, Plus } from "lucide-react";

type CareerCoachSidebarProps = {
  activeChatId?: string;
};

export function CareerCoachSidebar({ activeChatId }: CareerCoachSidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col overflow-y-auto border-r-2 border-[#d8e1dc] bg-[#f2f6f3] px-3 py-4 lg:flex">
      <div className="flex items-center justify-between px-2">
        <Link href="/" className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-[#e1ece5]">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#1f5a4d] text-[10px] font-bold text-white">AC</span>
          <span className="text-sm font-semibold tracking-tight text-[#18332d]">Career Coach</span>
        </Link>
        <Link href="/chat" aria-label="Start a new chat" className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 hover:bg-[#e1ece5] hover:text-[#18332d]">
          <Plus size={17} strokeWidth={2.2} />
        </Link>
      </div>

      <Link href="/chat" className="mt-5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#18332d] hover:bg-[#e1ece5]">
        <PencilLine size={16} strokeWidth={2} />
        New chat
      </Link>

      <div className="mt-7 px-3 text-[11px] font-semibold text-stone-500">Today</div>
      <Link href={activeChatId ? `/chat/${activeChatId}` : "/chat"} className="mt-2 truncate rounded-lg border border-[#c9ddd1] bg-[#e1eee6] px-3 py-2.5 text-left text-xs font-medium text-[#1f5a4d]">
        Career strategy session
      </Link>

      <div className="mt-auto space-y-1 border-t-2 border-[#d8e1dc] pt-3">
        <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs text-stone-600 hover:bg-[#e1ece5] hover:text-[#18332d]">
          <House size={15} strokeWidth={2} />
          <span>Home</span>
        </Link>
        <div className="rounded-lg px-3 py-2 text-[11px] leading-4 text-stone-400">Your conversations stay focused on your career goals.</div>
      </div>
    </aside>
  );
}
