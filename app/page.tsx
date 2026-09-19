import Link from "next/link";
import { ArrowRight, FileText, MessageCircle, Sparkles, Target } from "lucide-react";

const promptIdeas = [
  "Improve my resume for a product manager role",
  "Create a focused interview prep plan",
  "Help me choose between two career paths",
];

const waysToUseIt = [
  [FileText, "Bring your resume", "Get specific feedback on clarity, positioning, and impact."],
  [Target, "Name the next move", "Turn a broad ambition into a practical plan you can follow."],
  [MessageCircle, "Practice out loud", "Work through interviews, decisions, and difficult conversations."],
] as const;

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fbfaf6] text-[#18332d]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 sm:px-8">
        <header className="flex items-center justify-between border-b-2 border-[#dfe7e1] py-5">
          <Link href="/" className="flex items-center gap-2.5 rounded-lg">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1f5a4d] text-[10px] font-bold text-white">AC</span>
            <span className="text-sm font-bold tracking-[-0.02em]">Career Coach</span>
          </Link>
          <Link href="/chat" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#1f5a4d] transition hover:bg-[#eaf4ee]">
            Open chat <ArrowRight size={16} />
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-14 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20 lg:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#c9ddd1] bg-[#eef8f1] px-3 py-1.5 text-xs font-semibold text-[#1f5a4d]"><Sparkles size={14} /> A clearer way forward</div>
            <h1 className="mt-6 max-w-2xl text-5xl font-semibold leading-[1.05] tracking-[-0.055em] text-[#18332d] sm:text-6xl lg:text-7xl">Make your next career move with more confidence.</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-stone-600 sm:text-lg">A thoughtful AI coach for resumes, interviews, career decisions, and the small steps that turn a goal into momentum.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/chat" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1f5a4d] px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(31,90,77,0.18)] transition hover:bg-[#17453b] focus:outline-none focus:ring-2 focus:ring-[#1f5a4d]/30">Start a conversation <ArrowRight size={17} /></Link>
              <span className="text-xs text-stone-400">No setup. Start with a question.</span>
            </div>
          </div>

          <div className="relative lg:pl-4">
            <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-[#d9f3e6] blur-2xl" aria-hidden="true" />
            <div className="relative rounded-3xl border-2 border-[#dfe7e1] bg-white p-5 shadow-[0_18px_50px_rgba(31,90,77,0.1)] sm:p-7">
              <div className="flex items-center justify-between border-b border-[#e7ece8] pb-4">
                <div className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1f5a4d] text-xs font-bold text-white">A</span><div><p className="text-xs font-semibold text-[#18332d]">Career Coach</p><p className="text-[11px] text-stone-400">Ready when you are</p></div></div>
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              </div>
              <div className="py-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1f5a4d]">Try starting with</p>
                <div className="mt-4 space-y-2">{promptIdeas.map((prompt, index) => <Link key={prompt} href={`/chat?prompt=${encodeURIComponent(prompt)}`} className="group flex items-start gap-3 rounded-xl border border-[#e7ece8] p-3.5 transition hover:border-[#9fc9af] hover:bg-[#f5faf6]"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f8e4da] text-[11px] font-bold text-[#b96548]">{index + 1}</span><span className="flex-1 text-sm leading-5 text-stone-600 group-hover:text-[#18332d]">{prompt}</span><ArrowRight size={15} className="mt-0.5 shrink-0 text-stone-300 transition group-hover:translate-x-0.5 group-hover:text-[#1f5a4d]" /></Link>)}</div>
              </div>
              <div className="rounded-xl bg-[#f5f8f5] px-4 py-3 text-xs leading-5 text-stone-500">Start with the messy version. We&apos;ll shape it together.</div>
            </div>
          </div>
        </section>

        <section className="border-t-2 border-[#dfe7e1] py-8 sm:py-10"><div className="grid gap-7 sm:grid-cols-3 sm:gap-8">{waysToUseIt.map(([Icon, title, description]) => <div key={title} className="flex gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eaf4ee] text-[#1f5a4d]"><Icon size={17} /></span><div><h2 className="text-sm font-semibold text-[#18332d]">{title}</h2><p className="mt-1 text-xs leading-5 text-stone-500">{description}</p></div></div>)}</div></section>
      </div>
    </main>
  );
}
