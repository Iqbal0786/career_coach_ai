"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsSubmitting(true);
    const supabase = createClient();
    const result = mode === "sign-in"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
    setIsSubmitting(false);
    if (result.error) return setError(result.error.message);
    if (mode === "sign-up" && !result.data.session) return setNotice("Check your email to confirm your account, then sign in.");
    router.push(nextPath?.startsWith("/") ? nextPath : "/chat");
    router.refresh();
  }

  function toggleMode() {
    setMode(mode === "sign-in" ? "sign-up" : "sign-in");
    setError("");
    setNotice("");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <label className="block text-sm font-semibold">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[#dfe7e1] px-3 text-sm outline-none focus:border-[#1f5a4d] focus:ring-2 focus:ring-[#1f5a4d]/15" /></label>
      <label className="block text-sm font-semibold">Password<input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[#dfe7e1] px-3 text-sm outline-none focus:border-[#1f5a4d] focus:ring-2 focus:ring-[#1f5a4d]/15" /></label>
      {error && <p role="alert" className="text-sm text-[#b34e38]">{error}</p>}
      {notice && <p role="status" className="text-sm text-[#1f5a4d]">{notice}</p>}
      <button disabled={isSubmitting} className="h-11 w-full rounded-xl bg-[#1f5a4d] text-sm font-semibold text-white transition hover:bg-[#17453b] disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? "Please wait..." : mode === "sign-in" ? "Sign in" : "Create account"}</button>
      <button type="button" onClick={toggleMode} className="w-full text-sm font-semibold text-[#1f5a4d]">{mode === "sign-in" ? "New here? Create an account" : "Already have an account? Sign in"}</button>
    </form>
  );
}