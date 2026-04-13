/**
 * Roboflow API utilities for shelf scanning
 */

export interface RoboflowPrediction {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  class: string;
}

export interface ScanShelfResponse {
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

/**
 * Scan a shelf image using Roboflow API
 */
export async function scanShelf(imageFile: File): Promise<ScanShelfResponse> {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await fetch("/api/roboflow", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json()) as ScanShelfResponse;

  if (!response.ok) {
    throw new Error(data.error || "Failed to scan shelf");
  }

  return data;
}

/**
 * Chat with ShelfEye AI assistant
 */

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
    index: number;
  }>;
  model: string;
}

export async function chatWithAI(
  messages: ChatMessage[]
): Promise<ChatResponse> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages,
    }),
  });

  const data = (await response.json()) as ChatResponse;

  if (!response.ok) {
    throw new Error("Failed to get AI response");
  }

  return data;
}
