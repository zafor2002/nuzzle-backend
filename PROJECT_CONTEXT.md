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
- Notifications (likes, comments, follows), each type mutable per owner
- Direct messages (also the contact method for Adoption and Marketplace listings)
- Pet adoption listings (browse/filter by species, status lifecycle)
- Veterinary appointment booking (real slot availability, no double-booking)
- Marketplace (buy/sell pet products, category filter)

- Hashtags parsed from captions, linked, browsable at `/hashtags/[tag]`
- Search across people, pets, hashtags and caption text (`/search`)
- Private accounts (`Owner.isPrivate`), enforced at the query level
- Stories (24h expiry, ring tray, viewer, per-viewer seen tracking)
- Reels (short vertical video, snap feed, likes)
- Real-time message delivery over Supabase Realtime
- Settings (`/settings`): account details + password change, privacy toggles,
  per-type notification preferences, log out

**Not built:** follow *requests* — going private hides you from non-followers but
existing followers keep access, and there is no approval queue. No video
transcoding: Reels are served exactly as uploaded, which is why they are capped
at 50MB / 90s (see `src/lib/media.ts`). Raising that meaningfully means putting
Mux or Cloudflare Stream in front of Storage.

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
  without being asked. `Shell` renders a centered single-column `<main>`;
  `BottomNav` is always visible, not just below `lg`.
- **Light theme only.** The dark palette was removed (commit `b8a9100`) because the
  approved prototype has no dark variant and a second palette would need verifying
  on every screen. Restore by re-adding a `@media (prefers-color-scheme: dark)`
  block overriding the `:root` tokens in `globals.css`.
- **UI matches `prototypes/app.html`** — that file is the reference for every screen.
  Build screens by composing the primitives in `src/components/ui/`: `PageHeader`
  (back chevron + title + action), `FilterChips` (scrolling pill filters, rendered as
  links so filtering needs no client state), `Card` (padding is the `padded` prop,
  *not* a `p-*` className — Tailwind orders padding utilities by value, so a
  className override silently loses), `Avatar` (pastel tones, two-letter initials),
  `Button` (`size` md/sm), `Badge`, `EmptyState` (icon + title + action), `Icon`.
- Posts render as photo cards (`PostCard`): avatar + author + breed·date header,
  full-bleed media, then a horizontal like/comment row. The old Reddit-style
  vote-arrow column is gone.
- Generated Prisma client (`src/generated/prisma/`) is git-ignored; regenerated via
  the `postinstall` script (`prisma generate`) on every `npm install`. If a Vercel
  build ever fails with "Module not found: Can't resolve '@/generated/prisma/client'",
  that script is the fix — don't touch anything else first.
- Storage: all uploads (post photos, avatars, listing photos) go to one public
  Supabase Storage bucket, `post-media`, under feature-prefixed paths
  (`avatars/{ownerId}/...`, `adoption/{ownerId}/...`, `marketplace/{ownerId}/...`).

## Testing approach

`npm test` runs Vitest unit tests (`tests/unit/`). `npm run test:e2e` runs
Playwright (`tests/e2e/`) against a **production build** — `next dev` recompiles
each route on demand and turned a full pass into over an hour.

Two things to preserve when adding E2E tests:
- Accounts must be named `uitest*`; global teardown deletes rows by that prefix.
  It removes application rows only — matching Supabase Auth users are left, as
  deleting those needs a service-role key the app deliberately does not carry.
- Import `test` from `./fixtures`, not `@playwright/test`. The fixture gives each
  test a distinct `X-Forwarded-For` so the signup rate limiter stays fully active
  instead of being disabled for testing. `rate-limit.spec.ts` deliberately uses
  the plain `test` to prove the limiter still fires.

Historical note: before the suite existed, every feature was verified with a
disposable Playwright script run against the real dev server and Supabase, then
deleted. That discipline still applies to new work: typecheck, lint, build, then
exercise the feature for real — don't consider it done on a green build alone.
Add the test to the suite now rather than deleting the script.

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
- The Supabase DB password has been rotated locally; `DATABASE_URL` / `DIRECT_URL`
  in Vercel must be updated to match or the deployed site fails with `P1000`.
- Set file-size and MIME limits on the `post-media` bucket. `src/lib/media.ts`
  validates uploads and `mediaUrlSchema` rejects foreign URLs, but the client-side
  size cap is UX — the bucket itself is still the real boundary.
- Changing your email or username is not implemented; `/settings/account` shows
  both read-only and says so.
- Account deletion is not implemented. Removing the `Owner` row would cascade the
  application data but leave the Supabase Auth user behind — deleting that needs a
  service-role key the app deliberately does not carry, and the leftover user could
  still log in to a profile-less account.

## Where to look for more detail

`documentation/` has eight standalone LaTeX documents (not yet compiled to PDF, no
LaTeX distribution was available when they were written — see
`documentation/README.md` to compile): project overview, system architecture,
database design (all 16 Prisma models), feature specification, API/Server Actions
reference, deployment guide, user guide, security & privacy.

`prototypes/` holds backend-free HTML prototypes you can open directly in a browser:
`app.html` (all 28 screens, with a screen index sidebar — the visual reference the
app is built against), plus `onboarding.html`, `stories.html` and `reels.html` for
features that don't exist yet. They live outside `src/`, so they never affect the build.
