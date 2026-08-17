# Quran Mubarak

Online Quran academy website and learning-management CRM for [Quran Mubarak](https://quranmubarak.com) — an Islamic education academy teaching one-on-one live classes worldwide since 2011.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, React 19, TypeScript) |
| Styling | Tailwind CSS v4 |
| Backend | Firebase — Auth, Firestore, Storage, Functions |
| Hosting | Firebase Hosting (Next.js framework backend) |
| Icons | Lucide |
| Fonts | Bricolage Grotesque · Outfit · Shadows Into Light |

## Getting started

```bash
cd app
npm install
cp .env.example .env.local   # fill in your Firebase config
npm run dev
```

Open http://localhost:3000.

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run typecheck` | Type-check without emitting |
| `npm run lint` | Lint |

## Project structure

```
app/                      Next.js application
  src/
    app/                  Routes (App Router)
    components/
      layout/             Header, Footer
      sections/           Page sections (Hero, Courses, Pricing, …)
      ui/                 Primitives (Button, Card, Section, …)
    lib/
      content.ts          All site copy — single source of truth
      firebase.ts         Firebase client SDK
      leads.ts            Trial-registration writes
planning/                 Implementation plans and specs
firestore.rules           Firestore security rules
storage.rules             Cloud Storage security rules
firebase.json             Firebase project configuration
```

## Design system

The visual language uses a warm neo-brutalist palette with thick ink borders and hard offset shadows.

| Token | Value | Role |
|---|---|---|
| `--color-cream` | `#fef8ea` | Page background |
| `--color-cream-deep` | `#f5ecd3` | Alternating sections |
| `--color-ink` | `#2d1b4d` | Text, borders, shadows |
| `--color-purple` | `#6b46c1` | Primary |
| `--color-magenta` | `#db2777` | CTAs, focus ring |
| `--color-teal` | `#14b8a6` | Accents, underlines |
| `--color-amber` | `#f59e0b` | Highlights |

Signature treatment: `box-shadow: 4px 4px 0 0 var(--color-ink)` with a press
interaction that translates the element by the shadow offset — net-zero layout shift.

Amber and teal fail contrast as text colours and are therefore used only as
fills and borders, always with ink text on top.

## Deployment

```bash
firebase deploy                       # everything
firebase deploy --only hosting        # site only
firebase deploy --only firestore:rules,storage
```

## Documentation

- [`planning/CRM-IMPLEMENTATION-PLAN.md`](planning/CRM-IMPLEMENTATION-PLAN.md) — full CRM/LMS specification: portals, modules, data model, delivery plan
- [`planning/WEBSITE-FRONTEND-SPEC.md`](planning/WEBSITE-FRONTEND-SPEC.md) — website content inventory and design-system spec

## License

Proprietary. All rights reserved.
