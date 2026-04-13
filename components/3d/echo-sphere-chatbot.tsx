"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, SendHorizonal, Sparkles, X } from "lucide-react";
import type { Mesh } from "three";

import { SceneCanvas } from "@/components/3d/scene-canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEchoEngineStore } from "@/lib/stores/echo-engine-store";
import { ShelfScanner } from "@/components/shelfeye/shelf-scanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function PulseSphere({ intensity }: { intensity: number }) {
  const meshRef = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (!meshRef.current) {
      return;
    }

    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.4) * 0.05 * intensity;
    meshRef.current.scale.setScalar(pulse);
    meshRef.current.rotation.y += delta * 0.5;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.65, 64, 64]} />
      <meshPhysicalMaterial
        color="#818cf8"
        emissive="#4338ca"
        emissiveIntensity={0.9 + intensity * 0.3}
        metalness={0.65}
        roughness={0.12}
        clearcoat={1}
        transmission={0.12}
      />
    </mesh>
  );
}

function VoiceAvatar({ signal }: { signal: number }) {
  return (
    <div className="h-40 overflow-hidden rounded-3xl border border-indigo-400/30 bg-zinc-900/80">
      <SceneCanvas camera={{ position: [0, 0, 2.5], fov: 45 }} dpr={[1, 1.2]}>
        <ambientLight intensity={0.7} />
        <pointLight position={[2, 2, 2]} intensity={2.4} color="#818cf8" />
        <PulseSphere intensity={signal} />
        <Environment preset="studio" />
      </SceneCanvas>
    </div>
  );
}

export function EchoSphereChatbot() {
  const chatOpen = useEchoEngineStore((state) => state.chatOpen);
  const toggleChat = useEchoEngineStore((state) => state.toggleChat);
  const messages = useEchoEngineStore((state) => state.messages);
  const addMessage = useEchoEngineStore((state) => state.addMessage);
  const closeChat = useEchoEngineStore((state) => state.toggleChat);
  const [draft, setDraft] = useState("");
  const [voiceSignal, setVoiceSignal] = useState(0.7);
  const [scannerOpen, setScannerOpen] = useState(false);
  const messagesWrapRef = useRef<HTMLDivElement>(null);

  const particleNodes = useMemo(() => Array.from({ length: 22 }, (_, i) => i), []);

  useEffect(() => {
    if (!messagesWrapRef.current) {
      return;
    }
    messagesWrapRef.current.scrollTo({ top: messagesWrapRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!chatOpen) {
      return;
    }
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeChat();
      }
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [chatOpen, closeChat]);

  const sendMessage = async () => {
    if (!draft.trim()) {
      return;
    }

    const content = draft.trim();
    const userMsgId = crypto.randomUUID();
    const currentMessages = [...messages, { role: "user" as const, content }];
    addMessage({
      id: userMsgId,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    });

    const nextSignal = Math.min(2, 0.55 + content.length / 120);
    setVoiceSignal(nextSignal);
    setDraft("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: currentMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Chat API failed");
      }

      const data = await response.json();
      const assistantText = data.choices?.[0]?.message?.content || "I'm having trouble connecting to my retail brain right now.";

      addMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content: assistantText,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Echo chat error:", error);
      addMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again later.",
        createdAt: new Date().toISOString(),
      });
    }
  };

  const startVoice = () => {
    const SpeechRecognition =
      (window as Window & { webkitSpeechRecognition?: any }).webkitSpeechRecognition ||
      (window as Window & { SpeechRecognition?: any }).SpeechRecognition;

    if (!SpeechRecognition) {
      addMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Voice input is not supported in this browser session.",
        createdAt: new Date().toISOString(),
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0]?.transcript ?? "")
        .join("");
      setDraft(transcript);
      setVoiceSignal(Math.min(2.2, 0.8 + transcript.length / 120));
    };

    recognition.onend = () => setVoiceSignal(0.7);
    recognition.start();
  };

  return (
    <>
      <button
        onClick={toggleChat}
        className="fixed right-8 top-1/2 z-50 h-16 w-16 -translate-y-1/2 overflow-hidden rounded-full border border-indigo-400/35 bg-zinc-900/80 shadow-volumetric"
        aria-label="Toggle Echo chatbot"
        type="button"
      >
        <SceneCanvas camera={{ position: [0, 0, 2.5], fov: 45 }} dpr={[1, 1.2]}>
          <ambientLight intensity={0.6} />
          <pointLight intensity={2} position={[2, 2, 2]} color="#818cf8" />
          <PulseSphere intensity={chatOpen ? 1.25 : 0.75} />
          <Environment preset="warehouse" />
        </SceneCanvas>
      </button>

      <AnimatePresence>
        {chatOpen && (
          <motion.aside
            initial={{ opacity: 0, x: 36 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 28 }}
            transition={{ type: "spring", stiffness: 135, damping: 18 }}
            className="fixed inset-x-4 bottom-24 top-24 z-50 w-auto rounded-3xl border border-indigo-400/25 bg-zinc-900/90 p-4 shadow-volumetric backdrop-blur-3xl sm:inset-x-auto sm:right-24 sm:top-1/2 sm:h-[640px] sm:w-[360px] sm:-translate-y-1/2 sm:p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Echo Sphere</h3>
                <p className="text-xs text-zinc-400">Contextual AI Copilot</p>
              </div>
              <Sparkles className="h-5 w-5 text-indigo-300" />
            </div>

            <VoiceAvatar signal={voiceSignal} />

            <div ref={messagesWrapRef} className="mt-4 h-[calc(100%-308px)] min-h-[200px] space-y-3 overflow-y-auto pr-2 sm:h-[280px]">
              {messages.map((message, idx) => (
                <motion.article
                  key={message.id}
                  initial={{ opacity: 0, y: 10, z: -10 }}
                  animate={{ opacity: 1, y: 0, z: 0 }}
                  transition={{ delay: idx * 0.04, type: "spring", stiffness: 120, damping: 16 }}
                  className={`rounded-3xl border p-4 text-sm ${
                    message.role === "assistant"
                      ? "border-indigo-400/30 bg-indigo-500/10 text-zinc-100"
                      : "border-zinc-700 bg-zinc-800/60 text-zinc-200"
                  }`}
                >
                  {message.content}
                </motion.article>
              ))}
            </div>

            <div className="relative mt-4 rounded-3xl border border-zinc-700 bg-zinc-950/70 p-3">
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
                {particleNodes.map((node) => (
                  <motion.span
                    key={node}
                    className="absolute top-1/2 h-1 w-1 rounded-full bg-indigo-400/70"
                    style={{ left: `${(node / particleNodes.length) * 100}%` }}
                    animate={{ y: [8, -8, 8], opacity: [0.15, 0.85, 0.15] }}
                    transition={{
                      duration: 2.3,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: node * 0.07,
                    }}
                  />
                ))}
              </div>
              <div className="relative flex items-center gap-2">
                <Input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Direct Echo actions"
                  className="h-12 border-none bg-transparent p-0 text-sm"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => setScannerOpen(true)}>
                  <Camera className="h-4 w-4" />
                </Button>
                <Button type="button" size="icon" onClick={sendMessage}>
                  <SendHorizonal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
        <DialogContent className="max-w-4xl bg-zinc-950/90 border-indigo-400/25 text-zinc-100 backdrop-blur-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              ShelfEye Smart Scanner
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <ShelfScanner 
              onScanComplete={(result) => {
                if (result.success && result.data) {
                  addMessage({
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: `Scan complete! Detected ${result.data.annotatedProductCount} products with ${result.data.stockStatus} status.`,
                    createdAt: new Date().toISOString(),
                  });
                }
              }} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
