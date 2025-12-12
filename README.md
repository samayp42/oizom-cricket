# Oizom Champions League (OCL)

Premium cricket scoreboard manager and tournament organizer.

## Features

- **Live Scoring**: Real-time ball-by-ball scoring interface
- **Tournament Management**: Teams, groups, and match scheduling
- **Premium UI/UX**: Glassmorphism design, animations, and dark mode
- **Analytics**: Match statistics, partnerships, and player performance
- **Supabase Integration**: (Optional) Cloud database for real-time sync across devices

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000)

## Deployment

This app is optimized for Vercel deployment.

```bash
npm run build
vercel --prod
```

## Data Persistence

By default, data is saved to **LocalStorage**. To enable cloud sync with Supabase:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema provided in `supabase_schema.sql` in your Supabase SQL Editor
3. Create a `.env` file with your credentials:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
