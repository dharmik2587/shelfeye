"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Chrome, Mail, Lock, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthMode = "login" | "signup" | "forgot";

interface AuthFormCardProps {
  mode: AuthMode;
}

const modeMeta: Record<AuthMode, { title: string; description: string; cta: string }> = {
  login: {
    title: "Re-enter ShelfForge",
    description: "Sync with your living retail nervous system.",
    cta: "Enter Echo Grid",
  },
  signup: {
    title: "Create Your AI Retail Core",
    description: "Start the immersive ShelfForge control layer in under a minute.",
    cta: "Initialize System",
  },
  forgot: {
    title: "Restore Access",
    description: "Echo will send a secure reset pulse to your email.",
    cta: "Send Reset Pulse",
  },
};

function FloatingInput({
  id,
  label,
  type,
  icon: Icon,
}: {
  id: string;
  label: string;
  type: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div
      animate={{ y: focused ? -4 : 0 }}
      transition={{ type: "spring", stiffness: 170, damping: 18 }}
      className={`rounded-3xl border bg-zinc-900/70 p-4 ${focused ? "border-indigo-400 input-rim" : "border-zinc-700"}`}
    >
      <Label htmlFor={id} className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-zinc-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="h-10 border-none bg-transparent px-0 py-0 text-sm"
      />
    </motion.div>
  );
}

export function AuthFormCard({ mode }: AuthFormCardProps) {
  const meta = modeMeta[mode];
  const router = useRouter();

  const handlePrimaryAction = () => {
    if (mode === "forgot") {
      router.push("/login");
      return;
    }
    router.push("/dashboard");
  };

  return (
    <motion.div
      className="w-full max-w-[496px]"
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: [1, 1.012, 1] }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="echo-glass animate-breathe p-8">
        <CardHeader className="mb-8 p-0">
          <CardTitle className="text-3xl">{meta.title}</CardTitle>
          <CardDescription>{meta.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 p-0">
          {mode === "signup" && <FloatingInput id="name" label="Full Name" type="text" icon={User} />}
          <FloatingInput id="email" label="Email" type="email" icon={Mail} />
          {mode !== "forgot" && <FloatingInput id="password" label="Password" type="password" icon={Lock} />}

          <Button
            type="button"
            className="h-14 w-full rounded-3xl text-base"
            onClick={handlePrimaryAction}
          >
            <span className="mr-2">{meta.cta}</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-300" />
          </Button>

          {mode !== "forgot" && (
            <Button
              type="button"
              variant="outline"
              className="h-14 w-full rounded-3xl text-base"
              onClick={() => router.push("/dashboard")}
            >
              <Chrome className="mr-2 h-5 w-5" />
              Continue with Google
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
