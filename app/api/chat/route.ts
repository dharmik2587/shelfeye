import { NextRequest, NextResponse } from "next/server";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
}

// Predefined Q&A pairs for the chatbot
const PREDEFINED_QA: Record<string, string> = {
  "which products are running low on shelves?": "5 products are below the threshold: Milk (8 units), Bread (5 units), Eggs (12 units), Rice (10 units), and Cooking Oil (6 units). Would you like to initiate restocking?",
  "generate a restocking order for low inventory items.": "A restocking invoice has been generated for 5 items based on past demand patterns. Total estimated cost is ₹4,250. Would you like to send it to the supplier?",
  "suggest alternatives for out-of-stock products.": "Almond milk is out of stock. Recommended alternatives based on sales data are oat milk (high conversion rate) and soy milk (budget-friendly option).",
  "which products are close to expiry?": "12 products are nearing expiry within the next 3 days, including yogurt, paneer, and packaged salads. Would you like to apply discount tags?",
  "what should i discount to reduce waste?": "I recommend applying a 15–25% discount on dairy and ready-to-eat items expiring within 48 hours to maximize clearance and minimize loss.",
  "which shelves are underperforming?": "Aisle 3 (snacks section) has seen a 20% drop in sales this week. This may be due to product placement or low stock availability.",
  "how is staff performance today?": "Staff efficiency is at 87% today. Restocking tasks were completed on time, but shelf audits were delayed by an average of 15 minutes.",
  "assign restocking tasks to staff.": "Restocking tasks have been assigned to available staff based on workload. Estimated completion time is 25 minutes.",
  "which products should i stock more this week?": "Based on recent trends, demand is expected to rise for cold beverages, snacks, and ice cream. I recommend increasing stock by 20%.",
  "give me a quick overview of shelf status.": "82% of shelves are well-stocked, 10% need restocking, and 8% have products nearing expiry. Overall store health is stable."
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as ChatRequest;
    const { messages } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 }
      );
    }

    // Get the last user message
    const lastUserMessage = messages.filter(m => m.role === "user").pop();
    if (!lastUserMessage) {
      return NextResponse.json(
        { error: "No user message found" },
        { status: 400 }
      );
    }

    const query = lastUserMessage.content.toLowerCase().trim().replace(/[.?]$/, "");
    
    // Check for exact or close match in predefined Q&A
    let responseText = "";
    
    // Direct match or basic fuzzy match
    const foundKey = Object.keys(PREDEFINED_QA).find(key => {
      const normalizedKey = key.toLowerCase().trim().replace(/[.?]$/, "");
      return query.includes(normalizedKey) || normalizedKey.includes(query);
    });

    if (foundKey) {
      responseText = PREDEFINED_QA[foundKey];
    } else {
      responseText = "network error , try again";
    }

    return NextResponse.json({
      choices: [
        {
          message: {
            role: "assistant",
            content: responseText,
          },
          finish_reason: "stop",
          index: 0,
        },
      ],
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        error: "network error , try again",
      },
      { status: 500 }
    );
  }
}
