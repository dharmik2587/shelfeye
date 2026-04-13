import { NextRequest, NextResponse } from "next/server";

interface RoboflowAnnotation {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  class: string;
  class_id?: number;
}

interface RoboflowPrediction {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  class: string;
}

interface RoboflowResponse {
  predictions: RoboflowPrediction[];
  image: {
    width: number;
    height: number;
  };
  visualization?: string;
}

interface ShelfScanResult {
  success: boolean;
  data?: {
    predictions: RoboflowPrediction[];
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

function assignShelfZones(
  predictions: RoboflowPrediction[],
  imageWidth: number,
  imageHeight: number,
  cols = 3,
  rows = 3
): (RoboflowPrediction & { zone: string })[] {
  const colLabels = ["Left", "Center", "Right"];
  const rowLabels = ["Top", "Mid", "Bottom"];
  const colW = imageWidth / cols;
  const rowH = imageHeight / rows;

  return predictions.map((p) => {
    const ci = Math.min(Math.floor(p.x / colW), cols - 1);
    const ri = Math.min(Math.floor(p.y / rowH), rows - 1);
    return {
      ...p,
      zone: `${rowLabels[ri]}-${colLabels[ci]}`,
    };
  });
}

function assessStock(predictions: (RoboflowPrediction & { zone: string })[]) {
  // Catch ALL non-price tag detections as products
  // Also include anything with decent confidence (>40%) that isn't explicitly a label/tag
  const products = predictions.filter((p) => {
    const cls = p.class.toLowerCase();
    return !cls.includes("price") && 
           !cls.includes("label") && 
           !cls.includes("tag") &&
           p.confidence > 0.4;
  });
  
  const priceTags = predictions.filter((p) => {
    const cls = p.class.toLowerCase();
    return cls.includes("price") || cls.includes("label") || cls.includes("tag");
  });

  const productCount = products.length;
  const priceTagCount = priceTags.length;

  let stockStatus = "EMPTY";
  if (productCount === 0) stockStatus = "EMPTY";
  else if (productCount < 3) stockStatus = "CRITICAL LOW";
  else if (productCount < 8) stockStatus = "LOW STOCK";
  else if (productCount < 15) stockStatus = "MODERATE";
  else stockStatus = "OPTIMAL";

  // Calculate average confidence for all detected products
  const avgConf =
    productCount > 0
      ? products.reduce((sum, p) => sum + p.confidence, 0) / productCount
      : 0;

  const zoneCounts: Record<string, number> = {};
  products.forEach((p) => {
    zoneCounts[p.zone] = (zoneCounts[p.zone] || 0) + 1;
  });

  return {
    productCount,
    priceTagCount,
    stockStatus,
    avgConfidence: Number(avgConf.toFixed(4)),
    zoneDistribution: zoneCounts,
    priceTagStatus: priceTagCount > 0 ? "PRESENT" : "MISSING",
  };
}

export async function POST(request: NextRequest): Promise<NextResponse<ShelfScanResult>> {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: "No image provided" },
        { status: 400 }
      );
    }

    // Convert image to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    const apiKey = process.env.ROBOFLOW_API_KEY;
    const model = process.env.ROBOFLOW_MODEL;

    if (!apiKey || !model) {
      // Fallback mock data if keys are missing
      const mockPredictions = [
        { x: 150, y: 120, width: 80, height: 100, confidence: 0.92, class: "Product" },
        { x: 280, y: 150, width: 75, height: 95, confidence: 0.88, class: "Product" },
        { x: 420, y: 100, width: 90, height: 110, confidence: 0.95, class: "Product" },
      ];
      const imageSize = { width: 640, height: 480 };
      const enriched = assignShelfZones(mockPredictions, imageSize.width, imageSize.height);
      const stock = assessStock(enriched);

      return NextResponse.json({
        success: true,
        data: {
          predictions: enriched,
          imageSize,
          annotatedProductCount: stock.productCount,
          stockStatus: stock.stockStatus,
          avgConfidence: stock.avgConfidence,
          zoneDistribution: stock.zoneDistribution,
          priceTagStatus: stock.priceTagStatus,
          products: enriched.map((p, i) => ({
            id: `prod_${String(i + 1).padStart(3, "0")}`,
            name: `${p.class} ${i + 1}`,
            confidence: p.confidence,
            zone: p.zone,
            location: { x: p.x, y: p.y, width: p.width, height: p.height },
          })),
        },
      });
    }

    try {
      // Call Roboflow API with image
      // Correct Roboflow inference endpoint for base64
      const roboflowUrl = `https://detect.roboflow.com/${model}?api_key=${apiKey}&confidence=40&overlap=30`;
      
      const roboflowResponse = await fetch(roboflowUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        // Roboflow expects the base64 string as the body for POST
        body: base64Image,
      });

      if (!roboflowResponse.ok) {
        const errorText = await roboflowResponse.text();
        console.error("Roboflow API error text:", errorText);
        throw new Error(`Roboflow API error: ${roboflowResponse.status} - ${errorText}`);
      }

      const data = (await roboflowResponse.json()) as RoboflowResponse;

      // Enrich with zone and stock logic
      const enriched = assignShelfZones(data.predictions, data.image.width, data.image.height);
      const stock = assessStock(enriched);

      // Map products to ensure they show up even if class names are unusual
      const products = enriched.map((p, i) => ({
        id: `prod_${String(i + 1).padStart(3, "0")}`,
        name: p.class === "predictions" ? `Product ${i+1}` : `${p.class} ${i + 1}`,
        confidence: p.confidence,
        zone: p.zone,
        location: { x: p.x, y: p.y, width: p.width, height: p.height },
      }));

      return NextResponse.json({
        success: true,
        data: {
          predictions: enriched,
          imageSize: {
            width: data.image.width,
            height: data.image.height,
          },
          annotatedProductCount: products.length, // Total products detected
          stockStatus: stock.stockStatus,
          avgConfidence: stock.avgConfidence,
          zoneDistribution: stock.zoneDistribution,
          priceTagStatus: stock.priceTagStatus,
          products,
        },
      });
    } catch (apiError) {
      console.error("Roboflow API call error:", apiError);
      throw apiError;
    }
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
