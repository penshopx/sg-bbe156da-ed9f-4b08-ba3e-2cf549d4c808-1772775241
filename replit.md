# Chaesa Live - Micro-Learning Platform

## Overview
A Next.js (Pages Router) application for converting meetings into micro-learning courses. Built with React 18, TypeScript, Tailwind CSS, and Supabase.

## Architecture
- **Framework**: Next.js 15.5.9 (Pages Router, `src/pages/`)
- **Styling**: Tailwind CSS + Radix UI components + Framer Motion
- **Backend**: Supabase (auth + database), API routes in `src/pages/api/`
- **Payments**: Mayar.id (replaced Midtrans)
- **AI**: OpenAI API for meeting analysis and transcription

## Project Structure
```
src/
  pages/          - Next.js pages and API routes
    api/mayar/    - Mayar.id payment API (create-payment, webhook)
  components/     - React UI components
  contexts/       - React context providers
  hooks/          - Custom React hooks
  integrations/   - Supabase client setup
  lib/            - Utility functions
  services/       - Service layer
  styles/         - Global styles
public/           - Static assets
supabase/         - Supabase configuration
```

## Configuration
- **Port**: 5000 (bound to 0.0.0.0 for Replit)
- **Dev command**: `npm run dev` (next dev -p 5000 -H 0.0.0.0)
- **Build/Start**: `npm run build` / `npm run start`

## Required Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous/public key
- `OPENAI_API_KEY` - For AI features (meeting analysis, transcription)
- `MAYAR_API_KEY` - Mayar.id API key for payment processing
- `MAYAR_IS_PRODUCTION` - Set to "true" for production Mayar environment
- `NEXT_PUBLIC_BASE_URL` - Base URL for payment callbacks

## Theme
- Dark/Light mode via `next-themes` with Tailwind CSS class-based dark mode
- ThemeProvider configured with `attribute="class"` and `defaultTheme="dark"` in `_app.tsx`
- Toggle component: `src/components/ThemeSwitch.tsx` (in navbar on index page)
- Options: Terang (Light), Gelap (Dark), Sistem (System)

## Chatbot
- ChatWidget component (`src/components/ChatWidget.tsx`) rendered globally via `_app.tsx`
- API endpoint: `src/pages/api/chat/ask.ts` with AI (Replit AI Integrations / OpenAI)
- Uses `gpt-5-mini` model via `AI_INTEGRATIONS_OPENAI_BASE_URL` and `AI_INTEGRATIONS_OPENAI_API_KEY`
- Falls back to keyword-based knowledge base if AI unavailable
- Sends conversation history for multi-turn context
- Persona: Santai tapi sopan (casual but polite), uses "saya/aku" and "Kamu/Anda"
- All UI strings in Indonesian

## Live Schedule
- Page: `src/pages/schedule.tsx` — Create, edit, delete live sessions
- Data stored in localStorage (client-side)
- Features: Share via WhatsApp, Email, copy link/invite text
- Auto-generates meeting codes (format: XXXX-XXXX-XXXX)
- Status tracking: upcoming, live, ended
- Linked from navbar on index page as "Jadwal Live"

## Notes
- Supabase client handles missing env vars gracefully (warns instead of crashing)
- Payment gateway: Mayar.id (sandbox: api.mayar.club, production: api.mayar.id)
- Migrated from Vercel; `vercel.json` kept for reference but not used on Replit
