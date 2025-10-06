# EcoGenAI — Smart Waste Management

EcoGenAI is a modern, eco-focused waste management web app built with Next.js 14, Tailwind, Supabase, and Google Gemini 2.5 Flash. Classify waste with AI, track history, play with a QR Bin Scanner demo, and explore gamified progress.

## Features

- AI waste classification (Gemini 2.5 Flash)
  - Settings page to save/check your API key
  - Accurate JSON parsing and result enrichment (tips, disposal method, impact)
  - Classification history persists to Supabase for signed-in users
- Dashboard
  - Recent classifications, pickup stats, quick actions
- QR Bin Scanner (Demo)
  - No hardware/backend required; simulate scans via mock images/buttons
  - Confetti, points counter, demo leaderboard, and badge popups
  - Clear demo disclaimer
- Gamification-ready
  - Mock fallbacks for badges/leaderboard when DB tables are missing
- Theming
  - Eco light palette (#F8FFE4, #AEEA00, #FFD600)
  - Eco dark palette (#10271A, #26A65B)
- UI/Dev
  - shadcn/ui components, Tailwind, framer-motion animations

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS + shadcn/ui
- Supabase (Auth + DB)
- Google Generative AI SDK (`@google/generative-ai`)
- framer-motion, lucide-react
- pnpm

## Quickstart

1) Prerequisites
- Node 18+ and pnpm installed

2) Install
```bash
pnpm install
```

3) Environment
Create a `.env.local` file with:
```ini
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# Optional: you can keep this empty and paste the key in the Settings page
GEMINI_API_KEY=your_gemini_key
```

4) Database (Supabase)
- Open Supabase SQL editor and run the SQL from:
  - `scripts/001_create_tables.sql` (creates `public.waste_classifications`, `public.pickup_requests`, RLS policies, etc.)
  - `scripts/003_enhanced_classification.sql` (adds helpful columns/indexes)
- Optional: gamification schema `scripts/004_gamification_schema.sql`

5) Run Dev
```bash
pnpm dev
```
Open http://localhost:3000

## Gemini configuration
- Visit Settings (top nav → Settings)
- Paste your key and click “Check configuration”
- Need a key? Get one here: https://aistudio.google.com/api-keys
- The classify page will use your saved key (or the server env fallback)

## Classification History
- When signed in, every successful classification is saved on the server
- Endpoint: `app/api/classify-waste/route.ts` persists to `public.waste_classifications`
- Dashboard → Classification History displays your latest items

## QR Bin Scanner (Demo)
- Route: `/qr-scan`
- Simulate scans by clicking sample QR tiles, uploading a mock image, or hitting “Start Demo Scan”
- Shows confetti, points, history, fake leaderboard, and badges
- Disclaimer banner clarifies it’s a prototype (no real camera/backend)

## Scripts
- `scripts/001_create_tables.sql` — core tables + RLS
- `scripts/003_enhanced_classification.sql` — extra columns + index
- `scripts/004_gamification_schema.sql` — optional gamification tables
- `scripts/005_advanced_pickup_features.sql` — optional advanced pickup features

## Theming
- Colors defined in `app/globals.css` via CSS vars
- Tailwind maps tokens (including a `success` color) in `tailwind.config.ts`

## Troubleshooting
- Classification not saved? Confirm you’re signed in and that the `waste_classifications` table + RLS policies exist. Check the server logs for insert errors.
- Gamification tables missing? The API returns mock/demo data so the UI stays functional.
- Gemini errors? Set your `GEMINI_API_KEY` or paste a key in Settings and click “Check configuration”. Ensure model is `gemini-2.5-flash`.

## License
- This repository is provided as-is. Add your preferred license if needed.
