# Pharmacy Fast Order
A PWA-ready Next.js application for rapid pharmacy order creation.

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Copy `.env.example` to `.env.local` and add your Supabase credentials:
   ```bash
   cp .env.example .env.local
   ```
   *Required variables:*
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Supabase Database**:
   Run the SQL schema provided in `supabase_schema.sql` in your Supabase project's SQL Editor to set up tables and policies.

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser.

## Build for Production

This project is configured with PWA support using Webpack.
```bash
npm run build
```

## Features
- **PWA**: Installable on mobile devices (offline support).
- **Supabase**: Backend for Auth, Database, and Storage.
- **Swipe Actions**: `react-swipeable` for mobile-native feel.
- **Optimized**: Fast image loading and responsive design.
