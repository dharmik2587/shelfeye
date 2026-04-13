import { NextRequest, NextResponse } from "next/server";

// FEATURE 2: SMART PRODUCT ALTERNATIVES MAPPING
const ALTERNATIVES: Record<string, string[]> = {
  "coke": ["pepsi", "sprite"],
  "lays": ["kurkure", "doritos"],
  "sparkling water": ["perrier", "san pellegrino"],
  "protein bars": ["kind bars", "clif bars"],
  "cold brew": ["iced coffee", "latte"],
  "organic milk": ["soy milk", "almond milk"],
};

// FEATURE 3: EXPIRY RISK DATA (SIMULATED)
const EXPIRY_DATA: Record<string, number> = {
  "milk": 2,
  "bread": 1,
  "yogurt": 5,
  "fruit cups": 10,
  "cold brew": 3,
};

// FEATURE 4: STAFF PERFORMANCE TRACKER (IN-MEMORY)
const performanceLogs: Record<string, { issue_time: number; resolution_time?: number }> = {};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const product = searchParams.get("product")?.toLowerCase();

  if (type === "invoice" && product) {
    // FEATURE 1: AUTO INVOICE-BASED RESTOCKING
    const threshold = 15;
    const current_stock = parseInt(searchParams.get("stock") || "5");
    const reorder_qty = Math.max(threshold * 2 - current_stock, 0);
    const unit_price = 40;
    
    return NextResponse.json({
      product,
      reorder_qty,
      unit_price,
      total_cost: reorder_qty * unit_price,
      supplier: "ABC Supplier"
    });
  }

  if (type === "alternatives" && product) {
    // FEATURE 2: SMART PRODUCT ALTERNATIVES
    return NextResponse.json({
      product,
      alternatives: ALTERNATIVES[product] || ["No alternatives found"]
    });
  }

  if (type === "expiry") {
    // FEATURE 3: EXPIRY RISK DETECTION
    const results: Record<string, string> = {};
    for (const [item, days] of Object.entries(EXPIRY_DATA)) {
      if (days < 2) results[item] = "High Risk";
      else if (days < 4) results[item] = "Medium Risk";
      else results[item] = "Low Risk";
    }
    return NextResponse.json(results);
  }

  if (type === "staff") {
    // FEATURE 4: STAFF PERFORMANCE TRACKER
    const action = searchParams.get("action");
    if (action === "low" && product) {
      performanceLogs[product] = { issue_time: Date.now() };
      return NextResponse.json({ status: "logged_issue" });
    }
    if (action === "restocked" && product && performanceLogs[product]) {
      performanceLogs[product].resolution_time = Date.now();
      const diff = Math.round((performanceLogs[product].resolution_time! - performanceLogs[product].issue_time) / 60000);
      return NextResponse.json({
        product,
        response_time: `${diff} min`
      });
    }
    // Return average mock for display if no logs
    return NextResponse.json({
      product: product || "coke",
      response_time: "5 min"
    });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
