import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

interface Product {
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
}

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
    products: Product[];
  };
  error?: string;
}

interface ShelfScannerProps {
  onScanComplete?: (result: ScanResult) => void;
}

export const ShelfScanner: React.FC<ShelfScannerProps> = ({ onScanComplete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setResult(null);
    setError(null);

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const scanShelf = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch("/api/roboflow", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as ScanResult;

      if (!response.ok) {
        throw new Error(data.error || "Failed to scan shelf");
      }

      setResult(data);
      onScanComplete?.(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Scan error:", err);
    } finally {
      setLoading(false);
    }
  };

  const runDemoScan = async () => {
    setLoading(true);
    setError(null);
    setPreview("https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&q=80&w=1000"); // Mock shelf image

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockData: ScanResult = {
      success: true,
      data: {
        predictions: [],
        imageSize: { width: 1000, height: 800 },
        annotatedProductCount: 12,
        stockStatus: "MODERATE",
        avgConfidence: 0.89,
        zoneDistribution: { "Top-Center": 4, "Mid-Left": 5, "Bottom-Right": 3 },
        priceTagStatus: "PRESENT",
        products: Array.from({ length: 12 }).map((_, i) => ({
          id: `demo_${i + 1}`,
          name: `Sample Product ${i + 1}`,
          confidence: 0.85 + Math.random() * 0.1,
          zone: ["Top-Center", "Mid-Left", "Bottom-Right"][i % 3],
          location: { x: 100 * (i % 5), y: 150 * Math.floor(i / 5), width: 80, height: 120 }
        }))
      }
    };

    setResult(mockData);
    onScanComplete?.(mockData);
    setLoading(false);
  };

  const handleDragDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        setSelectedFile(file);
        setResult(null);
        setError(null);
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className="border-2 border-dashed border-blue-400 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors bg-gradient-to-b from-blue-500/5 to-transparent"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDragDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={loading}
        />

        {loading ? (
          <div className="space-y-3">
            <Loader2 className="w-12 h-12 mx-auto text-blue-400 animate-spin" />
            <p className="text-white text-lg font-semibold">Scanning shelf...</p>
            <p className="text-gray-400">Analyzing products and annotations</p>
          </div>
        ) : preview ? (
          <div className="space-y-4">
            <img
              src={preview}
              alt="Shelf preview"
              className="max-h-64 mx-auto rounded-lg"
            />
            <div className="flex gap-3 justify-center">
              <Button
                onClick={scanShelf}
                className="bg-blue-600 hover:bg-blue-700 font-bold"
                disabled={loading}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Scan Shelf
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
                disabled={loading}
              >
                <Upload className="w-4 h-4 mr-2" />
                Change Image
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              <Upload className="w-12 h-12 mx-auto text-blue-400" />
              <p className="text-white text-lg font-semibold">
                Scan Your Shelf
              </p>
              <p className="text-gray-400">
                Click to upload or drag and drop an image
              </p>
            </div>
            
            <div className="pt-4 border-t border-gray-800/50">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  runDemoScan();
                }}
                variant="outline"
                className="bg-blue-600/10 border-blue-500/50 text-blue-400 hover:bg-blue-600/20"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Run Demo Scan (Test Now)
              </Button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-semibold">Scan Failed</p>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {result?.success && result.data && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-400 text-xs font-semibold uppercase">Stock Status</p>
              <p className="text-white text-2xl font-bold">{result.data.stockStatus}</p>
            </div>
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-purple-400 text-xs font-semibold uppercase">Products</p>
              <p className="text-white text-2xl font-bold">{result.data.annotatedProductCount}</p>
            </div>
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-green-400 text-xs font-semibold uppercase">Avg Confidence</p>
              <p className="text-white text-2xl font-bold">{(result.data.avgConfidence * 100).toFixed(1)}%</p>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              Product Annotations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.data.products.map((product) => (
                <div
                  key={product.id}
                  className="p-3 bg-gray-800/50 border border-gray-700 rounded hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-white font-medium">{product.name}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30">
                          {product.zone}
                        </span>
                        <span className="text-[10px] text-gray-400">ID: {product.id}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-400 font-semibold text-sm">
                        {(product.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-gray-500 font-mono">
                    [{Math.round(product.location.x)}, {Math.round(product.location.y)}, {Math.round(product.location.width)}, {Math.round(product.location.height)}]
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
