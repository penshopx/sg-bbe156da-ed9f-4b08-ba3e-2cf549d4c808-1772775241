# Chaesa Live - Micro-Learning Platform

## Overview
A Next.js (Pages Router) application for converting meetings into micro-learning courses. Built with React 18, TypeScript, Tailwind CSS, and Supabase.

## Architecture
- **Framework**: Next.js 15.5.9 (Pages Router, `src/pages/`)
- **Styling**: Tailwind CSS + Radix UI components + Framer Motion
- **Backend**: Supabase (auth + database), API routes in `src/pages/api/`
- **Payments**: Stripe + Midtrans integration
- **AI**: OpenAI API for meeting analysis and transcription

## Project Structure
```
src/
  pages/          - Next.js pages and API routes
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
- `MIDTRANS_SERVER_KEY` / `MIDTRANS_CLIENT_KEY` - Payment processing
- `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` / `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION`
- `NEXT_PUBLIC_BASE_URL` - Base URL for payment callbacks
- `MIDTRANS_IS_PRODUCTION` - Midtrans environment flag

## Notes
- Supabase client handles missing env vars gracefully (warns instead of crashing)
- Migrated from Vercel; `vercel.json` kept for reference but not used on Replit
