---
name: fgc-brand
description: FGC Nord complete design system, tech stack, routing, and content handoff for styling and implementation decisions
type: prompt
whenToUse: When making UI, styling, color, typography, animation, routing, component, asset, or content decisions for the FGC Nord website
---

# FGC Nord — Komplet Kimi Code Handoff

## 1. Projekt-oversigt

| Field | Value |
| --- | --- |
| Navn | FGC Nord — Nordjyllands platform fighter-forening |
| Tech stack | React 19 + TypeScript + Vite 7 + Tailwind CSS 3.4 + shadcn/ui |
| Animation | Framer Motion + GSAP (ScrollTrigger) + Lenis (smooth scroll) |
| Router | React Router v7 (BrowserRouter) |
| Sprog | Dansk |
| Base path | `./` (relativ, til GitHub Pages / static hosting) |
| Max width | 1200px på alle sektioner |
| Fonts | Archivo Black (display), Bricolage Grotesque (heading), Inter (body) |

## 2. Farve-system (Tailwind custom colors)

| Token | Hex | Brug |
| --- | --- | --- |
| `cream` | `#F7F1E6` | Primær baggrund |
| `cream-dim` | `#EFE6D5` | Sekundær baggrund / hover |
| `ink` | `#141413` | Tekst, kanter, skygger |
| `olive` | `#51512A` | Sekundær tekst, mørk sektion |
| `brick` | `#A84434` | CTA, accent, knapper |
| `brick-soft` | `#C96A58` | Hover-states |
| `coal` | `#1A1A18` | Mørke sektioner (footer, CTA, games pin) |

Shadows: `shadow-poster` (6px), `shadow-poster-lg` (10px), `shadow-poster-sm` (4px) — alle med `#141413`.

## 3. Filstruktur

```
app/
├── index.html                    # Entry, Google Fonts, meta, favicon
├── vite.config.ts                # base: './', @ alias → ./src
├── tailwind.config.js            # Custom colors, fonts, shadows, animations
├── postcss.config.js
├── src/
│   ├── main.tsx                  # BrowserRouter + render
│   ├── App.tsx                   # Routes (Layout wrapper)
│   ├── index.css                 # Tailwind directives + halftone + link-underline
│   ├── App.css                   # (tom, klar til specifikke styles)
│   ├── lib/utils.ts              # cn() helper (clsx + tailwind-merge)
│   ├── hooks/use-mobile.ts       # shadcn hook
│   ├── pages/
│   │   ├── Home.tsx              # FORSIDE — 7 sektioner
│   │   ├── StageStrike.tsx       # FULDT FUNKTIONELT stage strike værktøj
│   │   └── Placeholder.tsx       # Under opbygning-side (genbrugt)
│   ├── components/
│   │   ├── Layout.tsx            # Navbar + Outlet + Footer, Lenis smooth scroll
│   │   ├── Navbar.tsx            # Sticky nav, mobil hamburger, Discord icon
│   │   ├── Footer.tsx            # 4-kolonne footer, sociale ikoner
│   │   ├── SectionHeader.tsx     # Eyebrow + H2 + brick underline
│   │   ├── EventCard.tsx         # Event-kort med dato-badge
│   │   ├── CTASection.tsx        # Genbrugt CTA-blok (coal baggrund)
│   │   ├── Sparkle.tsx           # 4-takket stjerne SVG (fra logo)
│   │   ├── WaveDivider.tsx       # SVG bølge med stroke-animation
│   │   └── home/
│   │       ├── HeroDecor.tsx     # Parallax dekorationer (Framer Motion)
│   │       └── GamesPinSection.tsx # GSAP ScrollTrigger pin-sektion
│   └── components/ui/            # 40+ shadcn komponenter (alle klar)
└── public/                       # Billeder, logos, stage thumbnails, favicons
    ├── fgc4v3_transparent.png    # Logo (bruges i nav + hero)
    ├── fgc4v3_dark.png           # Logo til footer
    ├── hero-illustration.png     # Hero billede
    ├── community-photo-1.png     # Om os sektion
    ├── board-avatars/            # Bestyrelses-avatars (5 stk)
    ├── stage-thumbs/             # Ultimate stage billeder (8 stk)
    └── melee-thumbs/             # Melee stage billeder (6 stk)
```

## 4. Routing

| Path | Side | Status |
| --- | --- | --- |
| `/` | Home — Forside | ✅ Færdig |
| `/turneringer` | Placeholder ("Kalender / Turneringer") | 🚧 Under opbygning |
| `/stage-strike` | StageStrike — Interaktivt værktøj | ✅ Færdig |
| `/om` | Placeholder ("Om foreningen") | 🚧 Under opbygning |
| `/bliv-medlem` | Placeholder ("Bliv medlem") | 🚧 Under opbygning |
| `*` | Placeholder (404) | ✅ Færdig |

## 5. Home-side sektioner (top til bund)

1. **Hero** (`bg-cream` + halftone) — parallax dekorationer, ord-for-ord animation, CTA knapper, flyvende logo, game chips
2. **WaveDivider** (`cream → olive`)
3. **Kommende Events** (`bg-olive text-cream`) — 3 event cards, snap-scroll på mobil
4. **Hvad er FGC Nord** (`bg-cream`) — billede med clipPath reveal, 3 værdier med sparkle-ikoner
5. **Vi spiller** (`bg-coal` — GSAP pin sektion) — 3 spil (Melee, Ultimate, RoA2) med scroll-scrub animation og progress bar
6. **Stage Strike Teaser** (`bg-cream`) — 4 stage thumbnails med hover-strike effekt, CTA til værktøjet
7. **CTA Section** (`bg-coal`) — "Klar til at join'e?" med 2 knapper

## 6. StageStrike — fuld logik

- **Spil**: Smash Ultimate (8 stages, 3 CP strikes) + Melee (6 stages, 1 CP strike)
- **Flow**: Hvem striker først → Game 1 strike (1-2-1) → Vinder rapporteres → Vinder striker CP → Taber vælger (DSR forbudt) → Gentag
- **DSR tracking**: `stageWins` array per spiller — vises i sidebar
- **UI**: Spillernavne (editable), score, status-banner, stage-grid med states (`idle`/`striked`/`banned`/`picked`/`inactive`), trin-for-trin guide i sidebar

## 7. Vigtige patterns

### Layout-komponent med Lenis

```tsx
// Layout.tsx — smooth scroll + page transition
const lenis = new Lenis({ lerp: 0.09 });
// + Framer Motion page fade på <main>
```

### GSAP Pin (isoléret komponent)

```tsx
// GamesPinSection.tsx — bruger useGSAP med scope
// ScrollTrigger: pin: true, scrub: 0.6, end: "+=150%"
// Respekterer prefers-reduced-motion
```

### WaveDivider

```tsx
// SVG path med stroke-dasharray animation
// flip prop til at vende bølgen
// animate={false} for at skippe stroke-animation
```

## 8. Hvad mangler / næste steps

| Område | Hvad der skal bygges |
| --- | --- |
| `/turneringer` | Event-kalender, filtrering, integration med start.gg API? |
| `/om` | Foreningshistorie, bestyrelse (board-avatars findes i `/public`), vedtægter, værdier |
| `/bliv-medlem` | Tilmeldingsform, prisoversigt, betalingsflow (Stripe?) |
| Globalt | Sitemap, robots.txt, Open Graph meta tags, PWA manifest? |
| Data | Events er hardcoded i `Home.tsx` — bør flyttes til CMS/API |

## 9. Hurtig start

```bash
cd /mnt/agents/output/app
npm install
npm run dev      # localhost:3000
npm run build    # dist/ m. relativ base path
```

## Usage instruction

When asked to implement, style, or modify the FGC Nord site, apply the tokens, fonts, max-width, routing structure, and section order above. Prefer the existing component patterns (`SectionHeader`, `CTASection`, `WaveDivider`, `Sparkle`) rather than inventing new ones. Keep all UI text in Danish. Respect `prefers-reduced-motion` for animations.
