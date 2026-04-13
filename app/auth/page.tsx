"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

import { AuthRole, useShelfEyeAuthStore } from "@/lib/stores/shelfeye-auth-store";

const ROLES: AuthRole[] = ["manager", "worker", "analyst"];

export default function AuthPage() {
  const router = useRouter();
  const hydrated = useShelfEyeAuthStore((state) => state.hydrated);
  const isAuthenticated = useShelfEyeAuthStore((state) => state.isAuthenticated);
  const login = useShelfEyeAuthStore((state) => state.login);
  const setHydrated = useShelfEyeAuthStore((state) => state.setHydrated);

  const [name, setName] = useState("Alex Rivera");
  const [email, setEmail] = useState("alex@shelfeye.ai");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AuthRole>("manager");

  useEffect(() => {
    if (!hydrated) {
      const timer = window.setTimeout(() => setHydrated(true), 80);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [hydrated, setHydrated]);

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      router.replace("/app");
    }
  }, [hydrated, isAuthenticated, router]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;
    login({
      name: name.trim(),
      email: email.trim(),
      role,
    });
    router.push("/app");
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10 sm:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="glass-panel relative overflow-hidden p-7 sm:p-9">
          <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-cyan-500/20 blur-3xl" />
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-slate-200">
            <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
            ShelfEye Access
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-white">Welcome back</h1>
          <p className="mt-3 max-w-lg text-sm text-slate-200">
            Sign in to open the live retail intelligence workspace. Your session is mocked locally and safe for demo use.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-slate-900/55 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Security</p>
              <p className="mt-2 text-sm text-slate-100">Zero external auth calls. Local secure demo session only.</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-slate-900/55 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Role mode</p>
              <p className="mt-2 text-sm text-slate-100">Switch between manager, worker, and analyst contexts.</p>
            </article>
          </div>

          <Link href="/" className="mt-8 inline-flex items-center gap-2 text-sm text-cyan-200">
            Back to landing <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <section className="glass-panel p-7 sm:p-9">
          <div className="flex items-center gap-2 text-sm text-slate-100">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            Secure Login
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-slate-400">
                Full name
              </label>
              <input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-xl border border-white/15 bg-slate-900/65 px-3 py-2.5 text-sm text-white outline-none"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-slate-400">
                Work email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-white/15 bg-slate-900/65 px-3 py-2.5 text-sm text-white outline-none"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-slate-400">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Use any password for demo"
                className="w-full rounded-xl border border-white/15 bg-slate-900/65 px-3 py-2.5 text-sm text-white outline-none"
              />
            </div>

            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.16em] text-slate-400">Role</p>
              <div className="flex gap-2">
                {ROLES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setRole(item)}
                    className={`rounded-full px-3 py-1.5 text-xs capitalize ${
                      role === item ? "bg-cyan-500/20 text-cyan-100" : "bg-white/5 text-slate-300"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300/70 bg-emerald-500/20 px-4 py-2.5 text-sm font-medium text-emerald-100"
            >
              Sign in to Workspace
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
