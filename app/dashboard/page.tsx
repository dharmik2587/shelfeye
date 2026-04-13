"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, UserCircle2, Camera } from "lucide-react";

import { LanguageToggle } from "@/components/shelfeye/language-toggle";
import { useLanguageStore } from "@/lib/stores/language-store";

const copy = {
  en: {
    worker: "Worker Dashboard",
    workerTitle: "Frontline operations cockpit",
    workerDesc: "Tasks, scan workflows, live map, attendance, and AI copiloting for store workers.",
    openWorker: "Open Worker View",
    manager: "Manager Dashboard",
    managerTitle: "Multi-store intelligence hub",
    managerDesc: "Health KPIs, live alerts, revenue analytics, worker management, and AI decision support.",
    openManager: "Open Manager View",
    scan: "Shelf Scan & Chat",
    scanTitle: "AI-powered shelf analysis",
    scanDesc: "Scan shelf images with Roboflow, get product annotations, and chat with ShelfEye AI for intelligent insights.",
    openScan: "Open Scan & Chat",
  },
  hi: {
    worker: "वर्कर डैशबोर्ड",
    workerTitle: "फ्रंटलाइन ऑपरेशन कॉकपिट",
    workerDesc: "स्टोर वर्कर्स के लिए कार्य, स्कैन वर्कफ़्लो, लाइव मैप, उपस्थिति और AI को-पायलट।",
    openWorker: "वर्कर व्यू खोलें",
    manager: "मैनेजर डैशबोर्ड",
    managerTitle: "मल्टी-स्टोर इंटेलिजेंस हब",
    managerDesc: "हेल्थ KPI, लाइव अलर्ट, राजस्व एनालिटिक्स, वर्कर मैनेजमेंट और AI निर्णय सहायता।",
    openManager: "मैनेजर व्यू खोलें",
    scan: "शेल्फ स्कैन और चैट",
    scanTitle: "AI-संचालित शेल्फ विश्लेषण",
    scanDesc: "Roboflow के साथ शेल्फ इमेजेस को स्कैन करें, उत्पाद एनोटेशन प्राप्त करें, और ShelfEye AI के साथ चैट करें।",
    openScan: "स्कैन और चैट खोलें",
  },
} as const;

export default function DashboardLandingPage() {
  const language = useLanguageStore((state) => state.language);
  const t = copy[language];

  return (
    <main className="lumina-root min-h-screen px-4 py-16 sm:px-8">
      <div className="mx-auto mb-6 flex w-full max-w-5xl justify-end">
        <LanguageToggle />
      </div>
      <div className="mx-auto grid w-full max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article className="lumina-glass rounded-3xl p-6">
          <div className="inline-flex items-center gap-2 text-sm text-cyan-100">
            <UserCircle2 className="h-4 w-4" />
            {t.worker}
          </div>
          <h1 className="mt-3 text-3xl font-semibold text-white">{t.workerTitle}</h1>
          <p className="mt-2 text-sm text-slate-300">{t.workerDesc}</p>
          <Link
            href="/dashboard/worker"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-500/20 px-4 py-2 text-sm text-cyan-100"
          >
            {t.openWorker}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </article>

        <article className="lumina-glass rounded-3xl p-6">
          <div className="inline-flex items-center gap-2 text-sm text-violet-200">
            <ShieldCheck className="h-4 w-4" />
            {t.manager}
          </div>
          <h2 className="mt-3 text-3xl font-semibold text-white">{t.managerTitle}</h2>
          <p className="mt-2 text-sm text-slate-300">{t.managerDesc}</p>
          <Link
            href="/dashboard/manager"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-violet-300/40 bg-violet-500/20 px-4 py-2 text-sm text-violet-100"
          >
            {t.openManager}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </article>

        <article className="lumina-glass rounded-3xl p-6">
          <div className="inline-flex items-center gap-2 text-sm text-blue-200">
            <Camera className="h-4 w-4" />
            {t.scan}
          </div>
          <h3 className="mt-3 text-3xl font-semibold text-white">{t.scanTitle}</h3>
          <p className="mt-2 text-sm text-slate-300">{t.scanDesc}</p>
          <Link
            href="/scan-shelf"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-blue-300/40 bg-blue-500/20 px-4 py-2 text-sm text-blue-100"
          >
            {t.openScan}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </article>
      </div>
    </main>
  );
}
