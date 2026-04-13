"use client";

import React, { useState } from "react";
import { ShelfScanner } from "@/components/shelfeye/shelf-scanner";
import { AIChatbot } from "@/components/shelfeye/ai-chatbot";

interface ScanResult {
  success: boolean;
  data?: {
    predictions: Array<unknown>;
    imageSize: {
      width: number;
      height: number;
    };
    annotatedProductCount: number;
    stockStatus: string;
    avgConfidence: number;
    zoneDistribution: Record<string, number>;
    priceTagStatus: string;
    products: Array<{
      id: string;
      name: string;
      confidence: number;
      zone: string;
      location: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
    }>;
  };
  error?: string;
}

export default function ScanShelfPage() {
  const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null);

  const handleScanComplete = (result: ScanResult) => {
    setLastScanResult(result);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Shelf Scanning & AI Analysis
          </h1>
          <p className="text-gray-400">
            Scan your shelves and get AI-powered insights with ShelfEye
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scanner Section */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 backdrop-blur">
            <h2 className="text-2xl font-bold text-white mb-6">Scan Shelf</h2>
            <ShelfScanner onScanComplete={handleScanComplete} />

            {lastScanResult?.success && lastScanResult.data && (
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-blue-300 text-sm">
                  💡 <strong>Pro Tip:</strong> Ask the AI chatbot questions about
                  the scan results, product placement optimization, or get
                  recommendations for shelf management!
                </p>
              </div>
            )}
          </div>

          {/* AI Chatbot Section */}
          <div className="h-[600px] lg:h-auto">
            <AIChatbot
              title="ShelfEye AI Assistant"
              placeholder="Ask about shelf analysis, stockouts, or product placement..."
            />
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-700/30 rounded-lg p-4">
            <h3 className="text-blue-300 font-semibold mb-2">🔍 Smart Scanning</h3>
            <p className="text-gray-400 text-sm">
              Upload shelf images to detect products, get confidence scores, and
              receive automated annotations.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-700/30 rounded-lg p-4">
            <h3 className="text-green-300 font-semibold mb-2">🤖 AI Insights</h3>
            <p className="text-gray-400 text-sm">
              Chat with our AI assistant powered by Grok for retail-specific
              recommendations and analysis.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-700/30 rounded-lg p-4">
            <h3 className="text-purple-300 font-semibold mb-2">
              📊 Data-Driven
            </h3>
            <p className="text-gray-400 text-sm">
              Get actionable insights for stockout prevention, product placement
              optimization, and revenue growth.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
