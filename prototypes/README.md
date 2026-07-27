# PetSocial — Frontend Prototypes

Clickable, **frontend-only** prototypes of features that don't exist in the real app
yet. No backend, no database, no build step — just open the `.html` file in a browser.

These are deliberately **outside** `src/`, so they have zero effect on the Next.js app
or its build.

## What's here

| File | Prototype | Why it exists |
|---|---|---|
| **`app.html`** | **The whole app — all 28 screens** | Full clickable walkthrough of every shipped feature, with a screen index sidebar |
| `onboarding.html` | Splash → 3 intro pages → sign-up choice | The real app drops users straight onto `/signup` with no introduction |
| `stories.html` | Story ring row on the feed → full-screen viewer | Not built — listed as "Not Yet Implemented" in the feature spec |
| `reels.html` | Full-screen vertical video feed with action rail | Not built — same |

## How to view

Double-click any file, or:

```bash
# from the project root
start prototypes/stories.html      # Windows
open prototypes/stories.html       # macOS
```

Each renders inside a 390×844 phone frame so it reads at real mobile proportions on a
desktop screen.

## What's interactive

- **app** — a sidebar lists all 28 screens, grouped by feature; click any one to jump
  straight to it, or navigate normally via the bottom tabs, the create FAB, and every
  card/row. Working state: like counts, save/bookmark, follow toggles, category chip
  filters, both anonymity switches, appendable comments and chat messages, and vet slot
  booking (grey slots are taken and refuse selection; Confirm stays disabled until you
  pick a free one).
- **onboarding** — splash auto-advances after 1.8s; `Next` / `Back` / `Skip` all work
- **stories** — tap a story ring to open the viewer; inside, tap the right side to
  advance, left side to go back, `×` to close. Segments auto-advance every 4.2s with
  animated progress bars.
- **reels** — scroll vertically to snap between reels; tap the heart to like (the count
  updates) or the bookmark to save

## Design constraints these follow

They reuse the real app's shipped design language so anything you approve translates
directly:

- **Palette** — the exact tokens from `src/app/globals.css`: `#FFFCF9` background,
  `#4A3F38` ink, `#F4915C` pastel coral primary, `#F1E7DE` borders, `#9C8F86` muted
- **Radius** — 20px, matching `--radius: 1.25rem`
- **Layout** — mobile-only single column with the fixed bottom tab bar (Home / Explore /
  Create FAB / Activity / Profile), matching `BottomNav`
- **Icons** — same custom stroke-icon style as `src/components/ui/icon.tsx`, no icon font

Stories and Reels intentionally commit to a **dark, full-bleed** treatment rather than
the app's light theme — that's standard for immersive media viewers and is a deliberate
choice, not an oversight.

## Fidelity caveats

- The "video" in Reels and the story media are CSS gradients with slowly drifting blurred
  blobs, not real media. They're there to convey motion and framing, not content.
- Pet avatars are initials-in-a-circle, same as the real app's `Avatar` fallback.
- Nothing persists. Refreshing resets all state.

## If you decide to build one for real

Each of these needs backend work before it's a real feature:

- **Stories** — a `Story` model with a 24-hour TTL, media upload, and per-viewer
  seen/unseen tracking
- **Reels** — video upload and transcoding (Supabase Storage handles files but not
  transcoding), plus a separate ranked feed query
- **Onboarding** — the least work; mostly static screens plus a "has completed
  onboarding" flag on `Owner`
