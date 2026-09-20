import { AuthForm } from "@/components/AuthForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbfaf6] px-5 py-12 text-[#18332d]">
      <div className="w-full max-w-md rounded-3xl border-2 border-[#dfe7e1] bg-white p-7 shadow-[0_18px_50px_rgba(31,90,77,0.1)] sm:p-9">
        <div className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1f5a4d] text-[10px] font-bold text-white">AC</span><span className="text-sm font-bold tracking-[-0.02em]">Career Coach</span></div>
        <div className="mt-10"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1f5a4d]">Your workspace</p><h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Pick up where you left off.</h1><p className="mt-3 text-sm leading-6 text-stone-500">Sign in to keep your conversations and career work in one place.</p></div>
        <AuthForm nextPath={next} />
      </div>
    </main>
  );
}