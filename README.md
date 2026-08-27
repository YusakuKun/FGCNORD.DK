# FGC Nord

Nordjyllands platform fighter-forening — en single-page application bygget med React, Vite, Tailwind CSS og shadcn/ui.

## Tech stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 3.4
- shadcn/ui komponenter
- React Router v7
- Framer Motion + GSAP (ScrollTrigger) + Lenis

## Kom i gang

```bash
npm install
npm run dev      # localhost:5173
npm run build    # dist/ med relativ base path
```

## Projektstruktur

```
.
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── lib/
│   │   ├── utils.ts
│   │   └── calendar.ts       # Google Calendar integration
│   ├── hooks/
│   │   └── use-mobile.ts
│   ├── types/
│   │   └── index.ts
│   ├── data/
│   │   └── events.ts         # Demo-events / fallback
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Turneringer.tsx
│   │   ├── StageStrike.tsx
│   │   └── Placeholder.tsx
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── SectionHeader.tsx
│   │   ├── EventCard.tsx
│   │   ├── CTASection.tsx
│   │   ├── Sparkle.tsx
│   │   ├── WaveDivider.tsx
│   │   └── home/
│   │       ├── HeroDecor.tsx
│   │       └── GamesPinSection.tsx
│   └── components/ui/        # shadcn komponenter
└── public/                   # Billeder, logos, stage thumbnails
```

## Routes

- `/` — Forside
- `/turneringer` — Eventkalender med Google Calendar integration
- `/stage-strike` — Interaktivt stage strike værktøj
- `/om` — Under opbygning
- `/bliv-medlem` — Under opbygning
- `*` — 404

## Google Calendar integration

Kalendersiden (`/turneringer`) kan hente events direkte fra en offentlig Google Calendar.

### Sådan sætter du det op

1. Gå til [Google Cloud Console](https://console.cloud.google.com/) og opret et projekt.
2. Aktivér **Google Calendar API**.
3. Gå til **Credentials** og opret en **API key**.
4. Gør din Google Calendar offentlig:
   - Åbn Google Calendar i browseren.
   - Klik på de tre prikker ved siden af kalenderen → **Settings and sharing**.
   - Under **Access permissions for events** vælg **Make available to public**.
5. Find **Calendar ID** under **Integrate calendar**.
6. Kopier `.env.example` til `.env` og indsæt værdierne:

```bash
cp .env.example .env
```

```env
VITE_GOOGLE_CALENDAR_ID=din-kalender-id@group.calendar.google.com
VITE_GOOGLE_CALENDAR_API_KEY=din-api-key
```

7. Genstart dev serveren.

Hvis API-kaldet fejler, vises demo-data fra `src/data/events.ts` automatisk.

## Assets

Pladsholder-billederne i `public/` kan udskiftes med rigtige assets. Filnavne følger handoff-specifikationen:

- `fgc4v3_transparent.png`
- `fgc4v3_dark.png`
- `hero-illustration.png`
- `community-photo-1.png`
- `stage-thumbs/*.png`
- `melee-thumbs/*.png`

Scriptet `scripts/generate-placeholders.py` kan køres igen for at regenerere pladsholdere.

## Bemærkninger

- `base` er sat til `./` i `vite.config.ts` for at understøtte GitHub Pages / static hosting.
- Farver og fonts er defineret i `tailwind.config.js`.
- Animationer respekterer `prefers-reduced-motion`.

## Clerk + Discord login (valgfrit)

`/bliv-medlem` understøtter login med Discord via Clerk. Det er helt frivilligt for brugeren — formularen kan også udfyldes manuelt.

### Opsætning

1. Opret en gratis konto på [clerk.com](https://clerk.com).
2. Opret en ny application i Clerk dashboard.
3. Gå til **User & Authentication > Social Connections** og aktivér **Discord**.
4. Følg Clarks guide til at forbinde din Discord OAuth app.
5. Find **Publishable key** under **API keys**.
6. Tilføj den til `.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

7. Genstart dev serveren.

## Medlemstilmeldinger (Cloudflare Pages Functions)

Når en bruger indsender formularen på `/bliv-medlem`, sendes data til `/api/membership`. Denne route er implementeret som en **Cloudflare Pages Function** i `functions/api/membership.js`.

Functionen validerer input og sender en besked til en Discord webhook.

### Sådan sætter du det op

1. Host sitet på **Cloudflare Pages**.
2. Opret en Discord webhook i den kanal, hvor tilmeldinger skal modtages.
3. I Cloudflare Pages dashboard under **Settings > Functions > Environment variables**, tilføj:

```
DISCORD_WEBHOOK_URL=din-discord-webhook-url
```

4. Deploy siden igen.

### Bemærkning

Under lokal udvikling med `npm run dev` kører Cloudflare Pages Functions ikke. Hvis du tester formularen lokalt, vil den derfor fejle med en netværksfejl, medmindre du også kører `wrangler pages dev`. I produktion virker den, når `DISCORD_WEBHOOK_URL` er sat.

Hvis du bruger en anden host end Cloudflare Pages, skal `functions/api/membership.js` konverteres til den pågældende platforms serverless function-format (f.eks. Netlify Function eller Vercel Edge Function).

## Deployment til Cloudflare Pages

Projektet er konfigureret til nem deployment på **Cloudflare Pages** med GitHub Actions.

### Manuel opsætning

1. Forbind dit GitHub-repo med Cloudflare Pages i dashboardet.
2. Sæt følgende secrets i GitHub under **Settings > Secrets and variables > Actions**:
   - `CLOUDFLARE_API_TOKEN` — lav en token med "Cloudflare Pages:Edit" rettigheder.
   - `CLOUDFLARE_ACCOUNT_ID` — findes på forsiden af Cloudflare dashboard.
   - `VITE_CLERK_PUBLISHABLE_KEY` (valgfrit, hvis Discord login bruges).
   - `VITE_GOOGLE_CALENDAR_ID` og `VITE_GOOGLE_CALENDAR_API_KEY` (valgfrit, hvis kalenderintegration bruges).
3. Sæt `DISCORD_WEBHOOK_URL` under **Cloudflare Pages dashboard > Settings > Functions > Environment variables**.
4. Push til `main` — GitHub Actions bygger og deployer automatisk.

### Lokalt med Wrangler

For at teste Cloudflare Pages Functions lokalt:

```bash
npx wrangler pages dev dist
```

Husk at bygge `dist/` først med `npm run build`.

### Filers rolle

- `wrangler.toml` — projektnavn og kompatibilitetsindstillinger.
- `public/_routes.json` — sørger for SPA routing, så alle ruter serverer `index.html`.
- `public/_headers` — sikkerhedsheaders og cache-regler for statiske filer.
- `.github/workflows/deploy.yml` — CI/CD pipeline.
