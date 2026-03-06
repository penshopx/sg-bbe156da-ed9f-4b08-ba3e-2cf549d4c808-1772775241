# Chaesa Live - Micro-Learning Platform

## Overview
A Next.js (Pages Router) application for converting meetings into micro-learning courses. Built with React 18, TypeScript, Tailwind CSS, and Supabase. Features creator tools for influencers, content creators, and digital marketers.

## Architecture
- **Framework**: Next.js 15.5.9 (Pages Router, `src/pages/`)
- **Styling**: Tailwind CSS + Radix UI components + Framer Motion
- **Backend**: Supabase (auth + database), API routes in `src/pages/api/`
- **Payments**: Mayar.id (replaced Midtrans)
- **AI**: OpenAI gpt-4o-mini via Replit AI Integrations for chatbot, captions, and content generation

## Project Structure
```
src/
  pages/          - Next.js pages and API routes
    api/mayar/    - Mayar.id payment API (create-payment, webhook)
    api/ai/       - AI APIs (generate-caption, optimize-social, generate-module, etc.)
    api/chat/     - Chatbot API (ask.ts)
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
- Draggable floating button — user can move it anywhere on screen (drag & drop)
- On mobile: opens full-screen; on desktop: opens as floating panel near button position
- API endpoint: `src/pages/api/chat/ask.ts` with AI (Replit AI Integrations / OpenAI)
- Uses `gpt-4o-mini` model via `AI_INTEGRATIONS_OPENAI_BASE_URL` and `AI_INTEGRATIONS_OPENAI_API_KEY`
- Falls back to keyword-based knowledge base if AI unavailable
- Sends conversation history for multi-turn context
- Renders bot messages as rich markdown (tables, headings, code blocks, lists)

## Creator Tools
### Creator Dashboard (`/creator-dashboard`)
- Page: `src/pages/creator-dashboard.tsx`
- Shows analytics: total views, subscribers, engagement rate, revenue
- Time range selector (7/30/90 days)
- Quick actions: Start Live, Create Content, Broadcast
- Recent content performance with views/engagement/revenue
- Top channel breakdown (YouTube, Instagram, TikTok, LinkedIn)

### Broadcast Hub (`/broadcast`)
- Page: `src/pages/broadcast.tsx`
- Multi-channel broadcast composer:
  - WhatsApp Blast: compose + send via wa.me links
  - Email Campaign: compose with subject/body, generates mailto links
  - Social Media: share to Twitter, Facebook, LinkedIn, copy captions for Instagram/TikTok/YouTube
- Template library (promo, event, content, reminder)
- Audience list management (add contacts, CSV import)
- Schedule broadcast (date/time picker)
- localStorage persistence for contacts

### Content Calendar (`/content-calendar`)
- Page: `src/pages/content-calendar.tsx`
- Monthly/weekly calendar view
- Color-coded entries: Live (green), Broadcast (blue), Content (purple)
- Integrates with existing schedule data from localStorage
- Add/edit/delete content plans
- localStorage persistence

### AI Caption Generator
- API: `src/pages/api/ai/generate-caption.ts`
- Generates platform-specific captions (Instagram, TikTok, YouTube, LinkedIn, Twitter)
- Tone options: fun, professional, viral
- Returns: caption, hashtags, emoji suggestions, best posting time
- Uses gpt-4o-mini with fallback to templates

## Live Schedule
- Page: `src/pages/schedule.tsx` — Create, edit, delete live sessions
- Data stored in localStorage (client-side)
- Features: Share via WhatsApp, Email, copy link/invite text
- Auto-generates meeting codes (format: XXXX-XXXX-XXXX)
- Status tracking: upcoming, live, ended

## Meeting Room
- Page: `src/pages/meeting/[id].tsx` — Live meeting room with video/audio
- In-meeting invite panel (Zoom-like): share link, copy meeting code, WhatsApp, email, copy invite text
- WebRTC-based video/audio, recording, reactions, polls, whiteboard, breakout rooms

## PWA (Progressive Web App)
- Manifest: `public/manifest.json` — app name, icons, shortcuts, theme color
- Service Worker: `public/sw.js` — network-first caching with offline fallback
- Offline page: `public/offline.html` — Indonesian offline message with retry button
- Icons: `public/icons/icon-{72,96,128,144,152,192,384,512}x*.png`
- Viewport meta in `_app.tsx` with `viewport-fit=cover` for safe-area support
- Service worker registered in `_app.tsx` on mount
- App installable on Android (Chrome) and iOS (Safari Add to Home Screen)

## Navigation
- Homepage navbar: Harga, AI Studio, Micro-Learning, Jadwal Live, Creator Tools (dropdown)
- Creator Tools dropdown: Dashboard Kreator, Broadcast & Marketing, Kalender Konten
- All new pages have consistent header with back-to-home link and theme toggle

## Notes
- Supabase client handles missing env vars gracefully (warns instead of crashing)
- Payment gateway: Mayar.id (sandbox: api.mayar.club, production: api.mayar.id)
- Global `overflow-x: hidden` on html/body to prevent horizontal scroll on mobile
- Migrated from Vercel; `vercel.json` kept for reference but not used on Replit
