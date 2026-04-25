# Groupe Acharaf — Ultra-Luxury Real Estate Website

## Overview

A cinematic, Dubai-level luxury real estate website for **Groupe Acharaf**, a Moroccan real estate developer. Features two brands (Estya — ultra-luxury, and Acharaf Immobilier — premium) with a full CMS back-office.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite, Framer Motion animations, Tailwind CSS
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

- **groupe-acharaf** (`/`) — Main website frontend
- **api-server** (`/api`) — Express REST API

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — cinematic hero, animated counters, featured projects |
| `/a-propos` | À propos — company story and values |
| `/nos-marques` | Nos Marques — Estya / Acharaf Immobilier brand switcher |
| `/nos-projets` | Nos Projets — art-gallery project grid with filters |
| `/nos-projets/:id` | Project detail — fullscreen gallery, specs, CTA |
| `/actualites` | Actualités — SEO blog article grid |
| `/actualites/:id` | Article detail — full article with SEO meta |
| `/carrieres` | Carrières — job listings with application form |
| `/contact` | Contact — lead submission form |
| `/admin` | Admin back-office CMS |

## Admin CMS Features

- Projects (create/edit/delete, assign to brand, set status & featured)
- Leads (view, delete)
- Articles (create/edit/delete with published toggle, SEO meta)
- Careers (create/edit/delete, active toggle)
- Applications (view all candidatures)

## Database Schema

Tables: `brands`, `projects`, `articles`, `careers`, `applications`, `leads`

## API Endpoints

See `lib/api-spec/openapi.yaml` for full spec. Key endpoints:
- GET/POST `/api/brands`
- GET/POST/PUT/DELETE `/api/projects`
- GET/POST/PUT/DELETE `/api/articles`
- GET/POST/PUT/DELETE `/api/careers`
- POST `/api/careers/:id/apply`
- GET `/api/applications`
- GET/POST/DELETE `/api/leads`
- GET `/api/stats`

## Design Theme — White Luxury

All public pages use a white luxury theme:
- **Backgrounds**: White primary (`#ffffff`), light alternate (`#DCE0E7`)
- **Authority text / headings**: `#082634` (deep teal-navy)
- **Accents / kickers**: `#8EA4AF` (muted steel blue)
- **Hero sections**: Full-screen cinematic images with dark overlays + white text (unchanged)
- **One dark section per page**: Final CTA or Signature section remains `bg-[#082634]` for dramatic contrast
- **NosMarques exception**: Estya brand section stays dark (`bg-[#080629]`) per brand identity; Acharaf section uses `bg-[#DCE0E7]`
- **Typography**: Cormorant Garamond (display serif) + Inter (body)
- **Buttons**: `btn-medium` (filled dark), `btn-outline-dark` (outline on light bg), `btn-outline-light` (outline on dark bg)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes
