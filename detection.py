"""
detection.py — Layer 1: Shelf Image Analysis & Product Detection
Connects to Roboflow, extracts predictions, classifies shelf zones.
"""

from inference_sdk import InferenceHTTPClient
import os
import json
from datetime import datetime


# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────
API_KEY        = "GHKM7S9MmB9nRnNzejIQ"
WORKSPACE      = "shashanks-workspace-iuujg"
WORKFLOW_ID    = "detect-count-and-visualize"
API_URL        = "https://serverless.roboflow.com"

client = InferenceHTTPClient(api_url=API_URL, api_key=API_KEY)


# ─────────────────────────────────────────────
# RUN DETECTION
# ─────────────────────────────────────────────
def run_detection(image_path: str) -> dict:
    """Run Roboflow workflow and return structured detection result."""
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {os.path.abspath(image_path)}")

    result = client.run_workflow(
        workspace_name=WORKSPACE,
        workflow_id=WORKFLOW_ID,
        images={"image": image_path},
        use_cache=True
    )

    output = result[0]
    raw_preds = output.get("predictions", {}).get("predictions", [])
    total_count = output.get("count_objects", len(raw_preds))

    # Normalise each prediction
    predictions = []
    for p in raw_preds:
        predictions.append({
            "class":        p.get("class", "Unknown"),
            "confidence":   round(p.get("confidence", 0), 4),
            "x":            p.get("x", 0),
            "y":            p.get("y", 0),
            "width":        p.get("width", 0),
            "height":       p.get("height", 0),
            "detection_id": p.get("detection_id", ""),
        })

    image_meta = output.get("predictions", {}).get("image", {})

    return {
        "image_path":   image_path,
        "image_width":  image_meta.get("width", 0),
        "image_height": image_meta.get("height", 0),
        "total_count":  total_count,
        "predictions":  predictions,
        "timestamp":    datetime.now().isoformat(),
    }


# ─────────────────────────────────────────────
# ZONE ANALYSIS
# ─────────────────────────────────────────────
def assign_shelf_zones(predictions: list, image_width: int, image_height: int,
                       cols: int = 3, rows: int = 3) -> list:
    """
    Divide the image into a grid of zones and tag each prediction
    with its shelf zone (e.g. "Top-Left", "Mid-Center").
    """
    col_labels = ["Left", "Center", "Right"]
    row_labels = ["Top", "Mid", "Bottom"]
    col_w = image_width  / cols
    row_h = image_height / rows

    enriched = []
    for p in predictions:
        ci = min(int(p["x"] / col_w), cols - 1)
        ri = min(int(p["y"] / row_h), rows - 1)
        p["zone"] = f"{row_labels[ri]}-{col_labels[ci]}"
        enriched.append(p)
    return enriched


# ─────────────────────────────────────────────
# STOCK ASSESSMENT
# ─────────────────────────────────────────────
def assess_stock(predictions: list) -> dict:
    """Count classes and determine stock status."""
    products   = [p for p in predictions if p["class"].lower() == "product"]
    price_tags = [p for p in predictions if "price" in p["class"].lower()]

    product_count   = len(products)
    price_tag_count = len(price_tags)

    if product_count == 0:
        stock_status = "EMPTY"
    elif product_count < 5:
        stock_status = "LOW STOCK"
    elif product_count < 15:
        stock_status = "MODERATE"
    else:
        stock_status = "FULL"

    avg_conf = (sum(p["confidence"] for p in products) / product_count
                if product_count else 0)

    zone_counts = {}
    for p in products:
        zone = p.get("zone", "Unknown")
        zone_counts[zone] = zone_counts.get(zone, 0) + 1

    return {
        "product_count":   product_count,
        "price_tag_count": price_tag_count,
        "stock_status":    stock_status,
        "avg_confidence":  round(avg_conf, 4),
        "zone_distribution": zone_counts,
        "price_tag_status": "PRESENT" if price_tag_count > 0 else "MISSING",
    }


# ─────────────────────────────────────────────
# QUICK RUN (standalone)
# ─────────────────────────────────────────────
if __name__ == "__main__":
    import sys
    img = sys.argv[1] if len(sys.argv) > 1 else "1.jpg"
    det = run_detection(img)
    det["predictions"] = assign_shelf_zones(
        det["predictions"], det["image_width"], det["image_height"]
    )
    stock = assess_stock(det["predictions"])
    print(json.dumps({**det, **stock}, indent=2))
