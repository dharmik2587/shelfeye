"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  ChartNoAxesCombined,
  Boxes,
  Radar,
  Sparkles,
  Store,
  WandSparkles,
} from "lucide-react";

const FEATURES = [
  {
    icon: Store,
    title: "Crisp 2D Store Map",
    description: "Navigate every aisle in a sharp top-down map and jump straight to risk pockets.",
  },
  {
    icon: BrainCircuit,
    title: "AI Insight Timeline",
    description: "Replay every key moment from the last 24 hours with explainable AI context.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Revenue Impact Simulator",
    description: "Model intervention outcomes before your team commits precious labor.",
  },
  {
    icon: Radar,
    title: "Predictive Alert Engine",
    description: "Turn upcoming stockout noise into prioritized, revenue-ranked action queues.",
  },
  {
    icon: Boxes,
    title: "Planogram Drift Control",
    description: "Catch compliance drift in real time, then resolve edits with drag-and-drop.",
  },
  {
    icon: WandSparkles,
    title: "Voice-First Copilot",
    description: "Shift between manager, worker, and analyst modes without leaving flow.",
  },
];

const MODELS = [
  {
    name: "Analytics Model",
    detail: "Detects anomalies, predicts trends, computes WMAPE, and outputs structured action JSON.",
  },
  {
    name: "Assistant Model",
    detail: "Role-based copilot grounded in live ShelfEye state with no off-context hallucinations.",
  },
  {
    name: "Planogram Vision Model",
    detail: "Matches expected versus detected shelf facings to surface drift before it compounds.",
  },
];

const COMPARISON = [
  { id: "A", label: "Store A", recovered: "₹244K", stockout: "18", compliance: "95%" },
  { id: "B", label: "Store B", recovered: "₹268K", stockout: "23", compliance: "91%" },
  { id: "C", label: "Store C", recovered: "₹205K", stockout: "15", compliance: "97%" },
];

function HeroShelves() {
  useFrame((state) => {
    state.scene.rotation.y = Math.sin(state.clock.elapsedTime * 0.26) * 0.18;
  });

  return (
    <group position={[0, -0.5, 0]}>
      {Array.from({ length: 6 }, (_, index) => (
        <Float key={`hero-shelf-${index}`} speed={1 + index * 0.08} floatIntensity={0.25} rotationIntensity={0.2}>
          <RoundedBox args={[1.15, 0.45, 0.8]} radius={0.12} position={[(index % 3) * 1.7 - 1.7, Math.floor(index / 3) * 0.75, 0]}>
            <meshStandardMaterial
              color={index % 2 === 0 ? "#10b981" : "#0ea5e9"}
              emissive={index % 2 === 0 ? "#10b981" : "#8b5cf6"}
              emissiveIntensity={0.2}
              metalness={0.3}
              roughness={0.15}
            />
          </RoundedBox>
        </Float>
      ))}
    </group>
  );
}

export function LandingPage() {
  const demoRef = useRef<HTMLDivElement | null>(null);
  const [activeStore, setActiveStore] = useState(0);
  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -170]);
  const orbScale = useTransform(scrollYProgress, [0, 0.4], [1, 1.18]);

  return (
    <div className="relative overflow-hidden">
      <motion.div style={{ y: yParallax }} className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-20 top-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute right-0 top-10 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl" />
        <motion.div style={{ scale: orbScale }} className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-500/20 blur-3xl" />
      </motion.div>

      <header className="sticky top-0 z-50 mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-8">
        <div className="glass-panel flex items-center gap-3 px-4 py-2 text-sm font-semibold text-white">
          <Sparkles className="h-4 w-4 text-emerald-300" />
          ShelfEye
        </div>
        <div className="glass-panel hidden items-center gap-4 px-5 py-3 text-xs uppercase tracking-[0.2em] text-slate-300 md:flex">
          <a href="#models">Models</a>
          <a href="#features">Features</a>
          <a href="#demo">Demo</a>
          <Link href="/auth" className="text-emerald-300">
            Launch App
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-24 px-4 pb-24 pt-14 sm:px-8">
        <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-7">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.26em] text-slate-200">
              <Sparkles className="h-4 w-4 text-emerald-300" />
              See the invisible. Act before it costs.
            </p>
            <h1 className="text-5xl font-semibold leading-tight text-white sm:text-6xl">
              Shelf intelligence that feels cinematic, not spreadsheet-native.
            </h1>
            <p className="max-w-2xl text-lg text-slate-200/90">
              ShelfEye combines a live 3D store twin, predictive AI, and multiplayer coordination so operators move before
              stockouts become losses.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => demoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="glass-panel inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                Launch Demo
                <ArrowRight className="h-4 w-4" />
              </button>
              <Link href="/auth" className="rounded-full border border-emerald-300/60 px-5 py-3 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/20">
                Open Live Workspace
              </Link>
            </div>
          </div>

          <div className="glass-panel relative h-[440px] overflow-hidden p-4">
            <Canvas camera={{ position: [0, 1.6, 4.4], fov: 45 }}>
              <ambientLight intensity={0.9} />
              <pointLight position={[4, 5, 3]} intensity={7} color="#38bdf8" />
              <pointLight position={[-3, 3, 2]} intensity={3.5} color="#10b981" />
              <HeroShelves />
            </Canvas>
            <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-2xl border border-white/15 bg-slate-900/55 p-4 backdrop-blur-2xl">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-300">Live signal</p>
              <p className="mt-2 text-2xl font-semibold text-white">₹82K at-risk revenue mitigated in the last 24h</p>
            </div>
          </div>
        </section>

        <section id="models" className="space-y-5">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-300">AI stack</p>
          <div className="grid gap-5 lg:grid-cols-3">
            {MODELS.map((model) => (
              <motion.article
                key={model.name}
                whileHover={{ y: -6, rotateX: 4, rotateY: -4 }}
                transition={{ type: "spring", damping: 22, stiffness: 200 }}
                className="glass-panel relative overflow-hidden p-6"
              >
                <h2 className="text-2xl font-semibold text-white">{model.name}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-200/90">{model.detail}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="features" className="space-y-5">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Platform capabilities</p>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {FEATURES.map((feature) => (
              <motion.article
                key={feature.title}
                whileHover={{ y: -8, rotateX: 5, rotateY: -5 }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
                className="glass-panel p-6"
              >
                <feature.icon className="h-6 w-6 text-emerald-300" />
                <h3 className="mt-4 text-xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-200/90">{feature.description}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section ref={demoRef} id="demo" className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="glass-panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <p className="text-sm font-medium text-slate-100">Product Demo Reel</p>
              <span className="text-xs uppercase tracking-[0.2em] text-emerald-300">Video Placeholder</span>
            </div>
            <div className="relative h-72 bg-gradient-to-br from-slate-950 via-cyan-950/50 to-emerald-950/50">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm text-white backdrop-blur-xl">
                  2m 18s cinematic walkthrough
                </div>
              </div>
            </div>
          </article>

          <article className="glass-panel space-y-4 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Store comparison</p>
            <div className="flex gap-2">
              {COMPARISON.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setActiveStore(index)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${index === activeStore ? "bg-emerald-400/25 text-emerald-100" : "bg-white/5 text-slate-300"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <motion.div
              key={COMPARISON[activeStore].id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/15 bg-slate-900/60 p-5"
            >
              <p className="text-lg font-semibold text-white">{COMPARISON[activeStore].label}</p>
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Recovered</p>
                  <p className="mt-1 text-white">{COMPARISON[activeStore].recovered}</p>
                </div>
                <div>
                  <p className="text-slate-400">Stockouts</p>
                  <p className="mt-1 text-white">{COMPARISON[activeStore].stockout}</p>
                </div>
                <div>
                  <p className="text-slate-400">Compliance</p>
                  <p className="mt-1 text-white">{COMPARISON[activeStore].compliance}</p>
                </div>
              </div>
            </motion.div>
          </article>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {[
            { name: "VP Ops, ModernMart", quote: "ShelfEye turned firefighting into foresight in less than two weeks." },
            { name: "Retail Director, Pivot Grocery", quote: "The 3D timeline replay finally got every team on one source of truth." },
            { name: "Head of AI, NorthGate", quote: "Forecast trust went up instantly once we exposed latency and confidence live." },
          ].map((testimonial) => (
            <article key={testimonial.name} className="glass-panel p-5">
              <p className="text-sm leading-relaxed text-slate-100">{testimonial.quote}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.18em] text-emerald-300">{testimonial.name}</p>
            </article>
          ))}
        </section>

        <footer className="glass-panel flex flex-wrap items-center justify-between gap-4 px-6 py-5 text-sm text-slate-300">
          <p>Trusted by Walmart, Target, 7-Eleven</p>
          <Link href="/auth" className="inline-flex items-center gap-2 text-emerald-300">
            Launch ShelfEye Demo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </footer>
      </main>
    </div>
  );
}
