"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { ANALYTICS, capture } from "@/lib/observability/analytics";

const input =
  "rounded-lg border border-rule bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none";

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const router = useRouter();
  const isSignUp = mode === "signup";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = isSignUp
      ? await authClient.signUp.email({ name, email, password, callbackURL: "/app" })
      : await authClient.signIn.email({ email, password, callbackURL: "/app" });
    setPending(false);
    if (res.error) {
      setError(res.error.message ?? "That didn't work. Check your details and try again.");
      return;
    }
    if (isSignUp) capture(ANALYTICS.signup, { method: "email" });
    router.push("/app");
    router.refresh();
  }

  function google() {
    setError(null);
    authClient.signIn.social({ provider: "google", callbackURL: "/app" });
  }

  return (
    <div className="w-full max-w-sm rounded-lg border border-rule bg-paper-raised p-6">
      <h1 className="text-xl font-semibold tracking-tight text-ink">
        {isSignUp ? "Create your account" : "Sign in"}
      </h1>
      <p className="mt-1 text-sm text-ink-muted">
        {isSignUp ? "Start explaining what you built." : "Welcome back."}
      </p>

      <button
        type="button"
        onClick={google}
        className="mt-5 w-full rounded-lg border border-rule-strong bg-paper-raised px-3 py-2 text-sm font-medium text-ink hover:bg-paper-sunken"
      >
        Continue with Google
      </button>

      <div className="my-4 flex items-center gap-3 text-xs text-ink-faint">
        <span className="h-px flex-1 bg-rule" /> or <span className="h-px flex-1 bg-rule" />
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        {isSignUp && (
          <input className={input} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
        )}
        <input className={input} type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        <input className={input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete={isSignUp ? "new-password" : "current-password"} minLength={8} />
        {error && <p className="text-sm text-failed">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {pending ? "One moment…" : isSignUp ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-sm text-ink-muted">
        {isSignUp ? "Already have an account? " : "No account yet? "}
        <Link href={isSignUp ? "/sign-in" : "/sign-up"} className="text-accent hover:underline">
          {isSignUp ? "Sign in" : "Create one"}
        </Link>
      </p>
    </div>
  );
}
