# PetSocial — Project Context

Read this first in any new conversation about this project. It's the fast-start
summary; the full detail lives in `documentation/` (LaTeX) and in individual
commit messages.

## What this is

A mobile-only social network for pet owners. A pet has its own profile — separate
from its owner's, with its own followers and posts — and either can be marked
anonymous independently, hiding the owner's real identity everywhere without
affecting functionality (messaging/moderation still resolve to the real account).

**Full feature list:**
- Auth (email/password via Supabase Auth, optional email confirmation)
- Owner & pet profiles, each editable, each with avatar upload and an anonymity toggle
- Posts (photo + caption, postable as the owner or as one of their pets), likes, comments
- Follow graph, scoping the home feed
- Breed/species communities (auto-derived from pet data, no separate table)
- Lost & Found alerts
- Pet health logs (owner-only, gated at the query level not just the UI)
- Notifications (likes, comments, follows)
- Direct messages (also the contact method for Adoption and Marketplace listings)
- Pet adoption listings (browse/filter by species, status lifecycle)
- Veterinary appointment booking (real slot availability, no double-booking)
- Marketplace (buy/sell pet products, category filter)

**Not built:** Stories, Reels, hashtags/search (the `Hashtag`/`HashtagsOnPosts`
tables exist in the schema but nothing uses them), automated tests, real-time
message delivery (page-revalidation based, not sockets).

## Stack

Next.js 16 (App Router) + TypeScript + React 19, Tailwind CSS v4, Prisma 7 over
PostgreSQL (Supabase), Supabase Auth + Storage, Zod validation on every Server
Action, an in-memory per-user rate limiter (`src/lib/rate-limit.ts` — fine for one
instance, needs a shared store like Upstash Redis before multi-instance scale).

No REST/GraphQL API — all mutations are Next.js Server Actions in
`src/app/actions/*.ts`, one file per feature domain (auth, pets, posts, engagement,
follows, lost-found, health, notifications, messages, adoption, vet, marketplace,
profile).

## Key conventions (don't reinvent these)

- **`requireUser()`** (`src/lib/auth.ts`) — call at the top of every authenticated
  Server Action/page; redirects to `/login` if there's no session. Never trust a
  client-supplied user id.
- **`isHidden(entity, owner)`** (`src/lib/visibility.ts`) — the one place anonymity
  resolution logic lives. Reuse it; don't reimplement the `isAnonymous` check per page.
- **`rateLimit(key, limit, windowMs)`** (`src/lib/rate-limit.ts`) — call in every
  mutating action, keyed by user id (or IP for signup).
- Every Server Action validates input with a Zod schema before touching the DB.
- Ownership checks are always a scoped query (`findFirst({ where: { id, ownerId: user.id } })`),
  never "fetch then check in JS."
- **Mobile-only design.** Desktop-specific layout (sidebars, `lg:`/`xl:` breakpoint
  branching) was deliberately removed (commit `7e3bbfb`) — don't reintroduce it
  without being asked. `Shell` is a plain centered single column now;
  `BottomNav` is always visible, not just below `lg`.
- Generated Prisma client (`src/generated/prisma/`) is git-ignored; regenerated via
  the `postinstall` script (`prisma generate`) on every `npm install`. If a Vercel
  build ever fails with "Module not found: Can't resolve '@/generated/prisma/client'",
  that script is the fix — don't touch anything else first.
- Storage: all uploads (post photos, avatars, listing photos) go to one public
  Supabase Storage bucket, `post-media`, under feature-prefixed paths
  (`avatars/{ownerId}/...`, `adoption/{ownerId}/...`, `marketplace/{ownerId}/...`).

## Testing approach

No automated test suite exists. Every feature was verified during development with
a disposable Playwright/Node script run against the real dev server and real
Supabase DB (sign up real accounts, click through the actual flow, assert on
rendered text/DOM), then the script was deleted and any test data cleaned up. If
you build a new feature, follow the same discipline — build, typecheck, lint,
build, then a real functional test — don't consider it done on a green build alone.

## Deployment

- **GitHub:** `https://github.com/abuzafor232/petly` (branch `main`)
- **Hosting:** Vercel, connected to the GitHub repo — every push to `main` builds
  and deploys automatically, no manual step.
- **Database/Auth/Storage:** Supabase project (see `.env.example` for the four
  required env vars: `DATABASE_URL`, `DIRECT_URL`,
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`).
- Full setup/deploy steps: `documentation/06-deployment-guide.tex`.

## Known open items

- Re-enable Supabase email confirmation + configure custom SMTP before any public
  launch (both were disabled/left on defaults for local dev testing).
- Rotate the Supabase DB password — it was pasted in plaintext during development
  chat sessions at least twice.
- `Owner.isPrivate` exists in the schema but is not enforced anywhere.
- No server-side validation of uploaded file type/size beyond the browser's
  `accept="image/*"` hint.

## Where to look for more detail

`documentation/` has eight standalone LaTeX documents (not yet compiled to PDF, no
LaTeX distribution was available when they were written — see
`documentation/README.md` to compile): project overview, system architecture,
database design (all 16 Prisma models), feature specification, API/Server Actions
reference, deployment guide, user guide, security & privacy.
