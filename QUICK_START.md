# Quick Start Guide - ShelfEye Shelf Scanning & AI Chatbot

## 🚀 What's New

You now have a fully functional shelf scanning and AI chatbot system integrated into your ShelfEye dashboard!

## 📁 Files Created

### API Routes
- **`/app/api/roboflow/scan.ts`** - Shelf image scanning endpoint that uses Roboflow API
- **`/app/api/chat/route.ts`** - AI chatbot endpoint powered by Grok API

### Frontend Components
- **`/components/shelfeye/shelf-scanner.tsx`** - Drag-and-drop image upload with product detection display
- **`/components/shelfeye/ai-chatbot.tsx`** - Full-featured AI chatbot interface with message history

### Pages
- **`/app/scan-shelf/page.tsx`** - Integrated page with scanner and chatbot side-by-side

### Utilities
- **`/lib/api/roboflow.ts`** - Reusable API utility functions
- **`.env.local`** - Environment variables with API keys already configured
- **`SHELF_SCANNING_GUIDE.md`** - Comprehensive documentation

## 🎯 How to Use

### 1. Access the Shelf Scanning Page
```
http://localhost:3000/scan-shelf
```

Or click the "Shelf Scan & Chat" card from your dashboard.

### 2. Scan a Shelf
1. **Upload an image** by clicking the upload area or dragging an image onto it
2. **Wait for processing** - the AI analyzes products on the shelf
3. **View annotations** - see all detected products with:
   - Product ID and name
   - Confidence score (0-100%)
   - Location on shelf (x, y coordinates)
   - Product dimensions (width × height)

### 3. Chat with AI
1. **Ask questions** about your shelf in the chatbot on the right
2. **Get insights** on:
   - Product placement optimization
   - Stockout prevention
   - Shelf layout improvements
   - Revenue maximization
   - Customer behavior patterns

## 💡 Example Workflow

```
User: [Uploads shelf image]
System: "Detected 3 products on shelf - Premium Cereal, Organic Snack, Health Bar"

User: "How can I improve the visibility of these products?"
AI: "Based on retail best practices:
   1. Eye-level placement increases visibility by 40%
   2. Place the Cereal at eye level (your highest-selling item)
   3. Group complementary products together
   4. Use the Health Bar as a cross-sell item
   5. Maintain consistent shelf heights"
```

## 🔑 API Keys Configured

Both APIs are already configured in `.env.local`:

✅ **Roboflow** - Product detection and annotation
- Model: `smart-shelf-wk0qc/8`
- Confidence threshold: 40%

✅ **Grok** - AI chatbot with retail-focused system prompt
- Model: `grok-beta`
- Hidden prompt optimized for shelf management

## 📊 Features Implemented

| Feature | Status | Details |
|---------|--------|---------|
| Shelf image scanning | ✅ | Roboflow integration with product detection |
| Product annotations | ✅ | Confidence scores, locations, bounding boxes |
| AI chatbot | ✅ | Full conversation support with context |
| Hidden system prompt | ✅ | Retail-focused guidance built-in |
| Dummy data fallback | ✅ | Works even if APIs are unavailable |
| Drag-and-drop upload | ✅ | Better UX than traditional file inputs |
| Real-time feedback | ✅ | Loading states, error messages, success confirmations |
| Mobile responsive | ✅ | Works on phone, tablet, and desktop |

## 🧪 Testing with Dummy Data

Both systems include fallback responses with realistic data:

**Shelf Scanner** - Returns mock detections:
- 3 sample products with various confidence scores
- Realistic bounding box coordinates
- Product metadata

**AI Chatbot** - Smart fallback responses:
- Recognizes keywords (stockout, placement, optimization)
- Provides relevant retail insights
- Works offline for demonstration

## 🔧 Customization

### Change the AI Prompt
Edit `/app/api/chat/route.ts` and modify `SYSTEM_PROMPT` variable

### Change Product Names
Edit `/app/api/roboflow/scan.ts` to customize fallback product names

### Adjust Confidence Threshold
Edit `/app/api/roboflow/scan.ts` - change `confidence=40` to your desired percentage

### Customize UI Colors
Edit component files to change Tailwind color classes:
- Blue theme for scanner: `from-blue-*` to `from-[your-color]-*`
- Cyan theme for chatbot: `from-cyan-*` to `from-[your-color]-*`

## 🐛 Troubleshooting

### "API key not configured"
- Check `.env.local` exists in project root
- Restart dev server after adding `.env.local`
- Ensure variables are not wrapped in quotes

### Scanning not uploading
- Check browser console for errors
- Ensure image format is JPEG or PNG
- Try a smaller image file
- Check network tab in DevTools

### Chatbot not responding
- Check API key in Grok dashboard
- Verify network connection
- Check browser console for errors
- Fallback responses should still work

### Images not displaying
- Check file size (keep under 5MB)
- Ensure CORS is properly configured
- Try Force refreshing the page (Ctrl+Shift+R)

## 📈 Next Steps

1. **Fine-tune prompts** for your specific use case
2. **Add analytics** to track scanning frequency and AI recommendations
3. **Integrate with dashboard** to show scan history
4. **Add user feedback** mechanism for AI response quality
5. **Enable image storage** for historical analysis
6. **Implement batch scanning** for multiple shelf images
7. **Add product database** to enrich annotations

## 📞 Support

For detailed documentation, see `SHELF_SCANNING_GUIDE.md` in the project root.

---

**Ready to scan?** Start at `/scan-shelf` and enjoy AI-powered shelf management! 🎉
