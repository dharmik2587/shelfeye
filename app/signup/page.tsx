import Link from "next/link";

import { AuthFormCard } from "@/components/2d/auth-form-card";
import { AuthBackgroundScene } from "@/components/3d/auth-background-scene";

export default function SignupPage() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 desktop-3d">
        <AuthBackgroundScene />
      </div>
      <div className="absolute inset-0 bg-zinc-950/55" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-8 py-16">
        <div className="space-y-4 text-center">
          <AuthFormCard mode="signup" />
          <p className="text-sm text-zinc-300">
            Already synced? <Link className="text-indigo-300" href="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
