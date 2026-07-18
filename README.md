# PetSocial

A social media app for pets and their owners — pet profiles, feeds, lost & found alerts, breed communities, health logs, and more.

## Stack

- **Frontend/Backend**: Next.js (App Router) + TypeScript
- **Database**: PostgreSQL via Prisma ORM
- **Styling**: Tailwind CSS

## Getting Started

1. Copy `.env.example` to `.env` and fill in your `DATABASE_URL` (get a free Postgres instance from [Supabase](https://supabase.com) or [Neon](https://neon.tech)).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the initial migration:
   ```bash
   npx prisma migrate dev --name init
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000).

## Data model

See [prisma/schema.prisma](prisma/schema.prisma) for the full schema: `Owner`, `Pet`, `Post`, `Comment`, `Like`, `Follow`, `Hashtag`, `Message`, `Notification`, `HealthLog`, `LostFoundPost`.

Both `Owner` and `Pet` support an `isAnonymous` flag — owner-level hides identity everywhere, pet-level overrides visibility for that pet specifically. Identity is always retained internally for moderation, even when hidden from display.
