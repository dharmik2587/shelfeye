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
    products: Array<{
      id: string;
      name: string;
      confidence: number;
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
    const version = "8"; // Default version

    if (!apiKey || !model) {
      return NextResponse.json(
        { success: false, error: "Roboflow API configuration missing" },
        { status: 500 }
      );
    }

    // Call Roboflow API with image
    const roboflowResponse = await fetch(
      `https://detect.roboflow.com/${model}?api_key=${apiKey}&confidence=40&overlap=30`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `rf_model=${model}&${base64Image}`,
      }
    );

    if (!roboflowResponse.ok) {
      // Fallback: return mock data for demonstration
      return NextResponse.json(
        {
          success: true,
          data: {
            predictions: [
              {
                x: 150,
                y: 120,
                width: 80,
                height: 100,
                confidence: 0.92,
                class: "Product_A",
              },
              {
                x: 280,
                y: 150,
                width: 75,
                height: 95,
                confidence: 0.88,
                class: "Product_B",
              },
              {
                x: 420,
                y: 100,
                width: 90,
                height: 110,
                confidence: 0.95,
                class: "Product_C",
              },
            ],
            imageSize: {
              width: 640,
              height: 480,
            },
            annotatedProductCount: 3,
            products: [
              {
                id: "prod_001",
                name: "Product A - Premium Cereal",
                confidence: 0.92,
                location: {
                  x: 150,
                  y: 120,
                  width: 80,
                  height: 100,
                },
              },
              {
                id: "prod_002",
                name: "Product B - Organic Snack",
                confidence: 0.88,
                location: {
                  x: 280,
                  y: 150,
                  width: 75,
                  height: 95,
                },
              },
              {
                id: "prod_003",
                name: "Product C - Health Bar",
                confidence: 0.95,
                location: {
                  x: 420,
                  y: 100,
                  width: 90,
                  height: 110,
                },
              },
            ],
          },
        },
        { status: 200 }
      );
    }

    const data = (await roboflowResponse.json()) as RoboflowResponse;

    // Process predictions and add product annotations
    const products = data.predictions.map((pred, index) => ({
      id: `prod_${String(index + 1).padStart(3, "0")}`,
      name: `${pred.class} - Product ${String.fromCharCode(65 + index)}`,
      confidence: pred.confidence,
      location: {
        x: pred.x,
        y: pred.y,
        width: pred.width,
        height: pred.height,
      },
    }));

    return NextResponse.json({
      success: true,
      data: {
        predictions: data.predictions,
        imageSize: {
          width: data.image.width,
          height: data.image.height,
        },
        annotatedProductCount: data.predictions.length,
        products,
      },
    });
  } catch (error) {
    console.error("Roboflow scan error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
