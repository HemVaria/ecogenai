# 🚀 Quick Start Guide

## Get Your Gemini API Key (Required!)

Your app is now using Google Gemini AI instead of Groq. You need to get an API key:

### Steps:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"** or **"Get API Key"**
4. Copy the generated key (starts with `AIza...`)
5. Open `.env.local` in your project
6. Replace `your_gemini_api_key_here` with your actual key:

```bash
GEMINI_API_KEY=AIzaSyC...your_actual_key_here
```

## Run the App

```bash
# Restart the development server
pnpm dev
```

## Test New Features

### 1. ✅ AI Classification
- Go to: http://localhost:3000/classify
- Upload a waste image
- See multi-item detection, OCR, and context tips

### 2. ✅ Chatbot Assistant
- Look for the **floating button** at bottom-right
- Click to open
- Ask: "Where should I throw batteries?"
- Get instant AI responses

### 3. ✅ Gamification Dashboard
- Go to: http://localhost:3000/gamification
- View your XP, level, and badges
- Check the leaderboard
- Track CO2 savings

### 4. ✅ QR Scanner
- Go to: http://localhost:3000/qr-scan
- Allow camera access
- Scan QR codes on waste bins
- Earn +10 XP per scan

## Database Setup (If Not Done)

Run these SQL scripts in your Supabase SQL Editor:

1. `scripts/001_create_tables.sql`
2. `scripts/002_profile_trigger.sql`
3. `scripts/003_enhanced_classification.sql`
4. `scripts/004_gamification_schema.sql`
5. `scripts/005_advanced_pickup_features.sql`
6. `scripts/006_social_sustainability.sql`

## Troubleshooting

### ❌ "API key not valid" Error
- Make sure your Gemini API key is correct
- Check `.env.local` has `GEMINI_API_KEY=...`
- Restart the dev server after adding the key

### ❌ Classification Not Working
- Verify Gemini API key is set
- Check browser console for errors
- Ensure image URL is accessible

### ❌ Chatbot Not Responding
- Same as above - check API key
- Verify `/api/chat` endpoint is working
- Check network tab for API errors

### ❌ Gamification Data Not Showing
- Make sure you're signed in
- Run database migrations (scripts folder)
- Check Supabase RLS policies are enabled
- Classify at least one item to generate stats

### ❌ QR Scanner Not Working
- Allow camera permissions in browser
- Try refreshing the page
- Check console for errors
- Ensure HTTPS or localhost (camera requires secure context)

## What's New?

### 🤖 Gemini AI Integration
- Better accuracy than Groq
- Superior OCR capabilities
- More detailed explanations
- Context-aware tips

### 💬 AI Chatbot
- Floating button (always accessible)
- Answers waste disposal questions
- Conversational interface
- Powered by Gemini

### 🎮 Gamification
- XP points system
- Level progression
- 10 badges to earn
- Global leaderboard
- Streak tracking

### 🌍 Environmental Impact
- CO2 savings tracker
- Trees planted equivalent
- Miles not driven equivalent
- Plastic items diverted

### 📱 QR Code Scanning
- Verify correct bin disposal
- Earn bonus XP
- Real-time feedback
- Camera-based scanning

## Next Steps

1. ✅ Get Gemini API key
2. ✅ Add it to `.env.local`
3. ✅ Restart server
4. ✅ Sign up/login
5. ✅ Classify your first item
6. ✅ Check your progress in `/gamification`
7. ✅ Try the chatbot
8. ✅ Scan a QR code

## Need More Help?

- **Feature Docs:** See `FEATURES.md`
- **Implementation Details:** See `IMPLEMENTATION_SUMMARY.md`
- **API Reference:** Check component files

---

**Happy waste classifying! 🌱**
