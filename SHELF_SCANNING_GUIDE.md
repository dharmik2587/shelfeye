# ShelfEye - Shelf Scanning & AI Chatbot Integration

## Overview

This integration adds two powerful features to your ShelfEye dashboard:

1. **Shelf Scanning** - Upload shelf images and get product annotations from Roboflow API
2. **AI Chatbot** - Get intelligent insights powered by Grok API with a hidden retail-focused system prompt

## Setup

### Environment Variables

All API keys are configured in `.env.local`:

```env
# Roboflow API Configuration
NEXT_PUBLIC_ROBOFLOW_API_KEY=your_roboflow_key_here
NEXT_PUBLIC_ROBOFLOW_MODEL=smart-shelf-wk0qc/8
ROBOFLOW_API_KEY=your_roboflow_key_here
ROBOFLOW_MODEL=smart-shelf-wk0qc/8

# Grok API Configuration
GROK_API_KEY=your_grok_key_here
NEXT_PUBLIC_GROK_API_ENDPOINT=https://api.x.ai/v1
```

## API Routes

### 1. Shelf Scanning: `/api/roboflow/scan`

**Method:** POST

**Request:**
- Form data with `image` field (image file)

**Response:**
```json
{
  "success": true,
  "data": {
    "predictions": [
      {
        "x": 150,
        "y": 120,
        "width": 80,
        "height": 100,
        "confidence": 0.92,
        "class": "Product_A"
      }
    ],
    "imageSize": {
      "width": 640,
      "height": 480
    },
    "annotatedProductCount": 3,
    "products": [
      {
        "id": "prod_001",
        "name": "Product A - Premium Cereal",
        "confidence": 0.92,
        "location": {
          "x": 150,
          "y": 120,
          "width": 80,
          "height": 100
        }
      }
    ]
  }
}
```

**Features:**
- Accepts JPEG and PNG images
- Returns bounding boxes for all detected products
- Provides confidence scores for each detection
- Includes product metadata and positioning
- Fallback dummy data when API unavailable

### 2. AI Chat: `/api/chat`

**Method:** POST

**Request:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "How can I optimize my shelf layout?"
    }
  ],
  "model": "grok-beta"
}
```

**Response:**
```json
{
  "choices": [
    {
      "message": {
        "content": "Optimal shelf layout should consider...",
        "role": "assistant"
      },
      "finish_reason": "stop",
      "index": 0
    }
  ],
  "model": "grok-beta"
}
```

**Features:**
- Fully functional AI chatbot powered by Grok
- Hidden system prompt optimized for retail shelf management
- Understands context about stockouts, product placement, and revenue optimization
- Provides multi-turn conversations
- Fallback responses with retail expertise when API unavailable

## Components

### ShelfScanner Component

Located at: `/components/shelfeye/shelf-scanner.tsx`

**Usage:**
```tsx
import { ShelfScanner } from "@/components/shelfeye/shelf-scanner";

<ShelfScanner onScanComplete={(result) => {
  console.log("Scan result:", result);
}} />
```

**Features:**
- Drag-and-drop image upload
- Click-to-upload button
- Drag over highlight effect
- Real-time preview
- Product annotation display
- Error handling and status messages

### AIChatbot Component

Located at: `/components/shelfeye/ai-chatbot.tsx`

**Usage:**
```tsx
import { AIChatbot } from "@/components/shelfeye/ai-chatbot";

<AIChatbot
  title="ShelfEye AI Assistant"
  placeholder="Ask about shelf management..."
/>
```

**Features:**
- Full chat interface with message history
- Timestamps for all messages
- Typing indicator while AI responds
- Scrolls to latest message automatically
- Disabled state while loading
- Customizable title and placeholder

## Integrated Page

### Scan & Chat Page

Located at: `/app/scan-shelf/page.tsx`

Access it at: `http://localhost:3000/scan-shelf`

**Features:**
- Side-by-side layout (scanner on left, chatbot on right)
- Responsive design for mobile
- Real-time scan result display
- Info cards explaining features
- Helpful tips for users
- Loading states and error handling

## Using the Features

### Step 1: Scan a Shelf
1. Navigate to `/scan-shelf`
2. Click the upload area or drag an image onto it
3. Wait for the AI to process the image
4. View product annotations with confidence scores
5. See product locations and dimensions

### Step 2: Chat with AI
1. Ask the AI about your scan results
2. Get recommendations on:
   - Shelf optimization
   - Stockout prevention
   - Product placement strategies
   - Revenue optimization
   - Store layout improvements

### Example Questions
- "What products are out of stock on my shelf?"
- "How can I improve product visibility?"
- "What's the best placement for new products?"
- "How do I prevent stockouts?"
- "Analyze my shelf for optimization opportunities"

## Dummy Data

The system includes comprehensive fallback responses:

- **Shelf Scanner**: Returns mock product detections with realistic confidence scores and positions when API is unavailable
- **AI Chatbot**: Provides expert retail insights based on question keywords (stockout, placement, optimization, etc.)

## Hidden System Prompt

The AI chatbot uses a hidden system prompt that makes it an expert in:

- Retail shelf management
- Stockout detection and prevention
- Product placement optimization
- Customer shopping patterns
- Shelf dynamics and visibility
- Revenue optimization strategies
- Inventory management best practices

The prompt is automatically sent with every request but invisible to the user.

## Error Handling

Both APIs include:
- Graceful fallbacks with dummy data
- Clear error messages
- Console logging for debugging
- Proper HTTP status codes
- User-friendly error displays

## Integration with Existing Dashboard

To add links to the scan page from your dashboard:

```tsx
<Link href="/scan-shelf" className="button-class">
  Scan Shelf & Chat
</Link>
```

## Performance Notes

- Images are converted to base64 for API transmission
- Drag-and-drop provides better UX than traditional file inputs
- Loading states prevent multiple submissions
- Message history is kept in component state
- Timestamps help users track conversation flow

## Next Steps

1. Test shelf scanning with real product images
2. Fine-tune AI responses for your specific use case
3. Integrate scan results with your analytics dashboard
4. Add more sophisticated error recovery
5. Implement user feedback mechanisms
6. Track successful detections and AI response quality
