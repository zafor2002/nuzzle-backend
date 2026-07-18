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

## Supabase setup

Besides `DATABASE_URL`/`DIRECT_URL` (Prisma) and `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Auth), post image uploads need a Storage bucket:

1. Dashboard → **Storage** → **New bucket** → name it `post-media`, mark it **public**.
2. Dashboard → **SQL Editor** → run:
   ```sql
   create policy "Allow authenticated uploads to post-media"
   on storage.objects for insert
   to authenticated
   with check (bucket_id = 'post-media');

   create policy "Allow public read of post-media"
   on storage.objects for select
   to public
   using (bucket_id = 'post-media');
   ```
   (The dashboard's built-in policy templates can end up scoped incorrectly — this explicit SQL is the known-good version.)

For local development, email confirmation can be turned off under **Authentication → Sign In / Providers → Email** so signup logs you in immediately. Turn it back on before launch. Supabase's default built-in email sender also has a very low rate limit — set up custom SMTP before relying on real signup emails in production.

## Data model

See [prisma/schema.prisma](prisma/schema.prisma) for the full schema: `Owner`, `Pet`, `Post`, `Comment`, `Like`, `Follow`, `Hashtag`, `Message`, `Notification`, `HealthLog`, `LostFoundPost`.

Both `Owner` and `Pet` support an `isAnonymous` flag — owner-level hides identity everywhere, pet-level overrides visibility for that pet specifically. Identity is always retained internally for moderation, even when hidden from display.
