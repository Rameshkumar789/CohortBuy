# CohortBuy Website

The official landing page for CohortBuy - **Wholesale, reinvented.**

## About

CohortBuy is a platform that brings buyers together to unlock wholesale prices. Better prices for buyers. Guaranteed demand for sellers. Everyone wins.

## Tech Stack

- **Framework:** Next.js 16 (React)
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
# Create .env.local with:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Project Structure

```
website/
├── src/
│   ├── app/
│   │   ├── page.tsx        # Main landing page
│   │   ├── layout.tsx      # Root layout with metadata
│   │   └── globals.css     # Global styles & theme
│   └── lib/
│       └── supabase.ts     # Supabase client & functions
├── public/
│   └── favicon.svg         # Site favicon
└── .env.local              # Environment variables (not committed)
```

## Features

- ✅ Modern, responsive landing page
- ✅ Email waitlist collection
- ✅ Supabase integration for data storage
- ✅ Email validation
- ✅ Loading states & error handling

## Deployment

Deploy on Vercel:

1. Import this repo to [Vercel](https://vercel.com)
2. Set **Root Directory** to `website`
3. Add environment variables in Vercel dashboard
4. Deploy!

## License

Private - All rights reserved © 2025 CohortBuy
