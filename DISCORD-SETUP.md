# Discord-integration — komplet opsætningsguide

Alt her kan klares i browseren — ingen lokal maskine nødvendig.
Arbejd dig gennem trinnene i rækkefølge, så er hele integrationen klar,
når siden går live.

---

## Hvad integrationen kan

| Feature | Hvordan |
| --- | --- |
| Log ind med Discord | OAuth2 via LazyTO-appen |
| Medlemskab = Discord-rolle | Bot API tjekker @Medlem-rollen på serveren |
| Tilmeld / check-in på turnering | Discord-login på `/t/<kode>` |
| Opslag på Discord ved ny turnering | Webhook + ping af @Medlem |
| Opslag ved tilmelding, check-in, bracket-start og kampresultater | Webhook-embeds |
| Admin-panel | `/admin` (footer-link "Web admin") + `ADMIN_API_KEY` |

---

## Trin 1 — Discord-serveren

Opret serveren (eller brug den eksisterende) med denne struktur:

### Roller (Server Settings → Roles)

| Rolle | Formål | Vigtige indstillinger |
| --- | --- | --- |
| `@Crew` | TOs / admins | Administrator eller i hvert fald Manage Server |
| `@Medlem` | **Medlemsrollen** — den hjemmesiden tracker | Ingen særlige tilladelser; giv den en pæn farve |
| `@LazyTO` (bot) | Vores bot | Oprettes automatisk ved invite |

> Navnet på medlemsrollen er ligegyldigt — det er rolle-**ID'et**, der
> bruges i koden (`DISCORD_MEMBER_ROLE_ID`).

### Kanaler

| Kanal | Type | Formål |
| --- | --- | --- |
| `#regler-og-info` | Tekst (read-only for @Medlem) | Velkomst, regler, link til fgcnord.dk |
| `#turneringer` | Tekst | **Webhook-kanalen** — her lander alle bracket-opslag |
| `#check-in` | Tekst | Manuel snak om check-in på dagen |
| `#finder-modstander` | Tekst | Spillerne aftaler kampe |
| `#crew` | Tekst (kun @Crew) | Intern |
| `🔊 Venue` / `🔊 Setup 1..n` | Voice | På dagen |

Giv @Medlem adgang til at læse/skrive i spiller-kanalerne, men kun læse i
`#regler-og-info` og `#turneringer`.

---

## Trin 2 — Discord Developer Portal (LazyTO-appen)

Appen findes allerede: **LazyTO**, Application ID `1544181343385034784`.

1. Gå til https://discord.com/developers/applications → **LazyTO**
2. **OAuth2 → General**
   - Redirects — tilføj:
     - `https://fgcnord.dk/api/auth/discord/callback`
     - `http://localhost:8788/api/auth/discord/callback` (lokal test)
   - Gem
3. **Bot**
   - Slå **Server Members Intent** TIL (krævet for medlemsrolle-tjek)
   - Kopier/nulstil **token** → gem som `DISCORD_BOT_TOKEN` (se trin 5)
4. Inviter botten til serveren med dette link (åbn det mens du er logget
   ind med en konto, der har Manage Server):

   ```
   https://discord.com/oauth2/authorize?client_id=1544181343385034784&scope=bot&permissions=0
   ```

---

## Trin 3 — Webhook (opslagskanalen)

1. Discord → Server Settings → **Integrations → Webhooks** → **New Webhook**
2. Navn: `FGC Nord Bracket`, kanal: `#turneringer`
3. **Copy Webhook URL** → gem som `DISCORD_WEBHOOK_URL` (trin 5)

---

## Trin 4 — Find ID'erne

Slå **Developer Mode** til: Discord → User Settings → Advanced → Developer Mode.

| ID | Sådan finder du det |
| --- | --- |
| `DISCORD_GUILD_ID` | Højreklik på serveren → **Copy Server ID** |
| `DISCORD_MEMBER_ROLE_ID` | Server Settings → Roles → højreklik på @Medlem → **Copy Role ID** |
| `DISCORD_PING_ROLE_ID` *(valgfri)* | Som ovenfor, hvis ping-rollen skal være en anden end medlemsrollen |

---

## Trin 5 — Cloudflare secrets

Cloudflare-dashboard → **Workers & Pages** → fgcnord.dk-projektet →
**Settings → Variables and Secrets** → tilføj som **Secrets**:

| Navn | Værdi / hvor den kommer fra |
| --- | --- |
| `DISCORD_CLIENT_ID` | `1544181343385034784` |
| `DISCORD_CLIENT_SECRET` | Developer Portal → OAuth2 → Client Secret |
| `DISCORD_REDIRECT_URI` | `https://fgcnord.dk/api/auth/discord/callback` |
| `DISCORD_BOT_TOKEN` | Developer Portal → Bot → Token |
| `DISCORD_GUILD_ID` | Trin 4 |
| `DISCORD_MEMBER_ROLE_ID` | Trin 4 |
| `DISCORD_PING_ROLE_ID` | Trin 4 *(valgfri — ellers pinges medlemsrollen)* |
| `DISCORD_WEBHOOK_URL` | Trin 3 |
| `SESSION_SECRET` | Tilfældig streng, mindst 32 tegn (fx fra 1Password-generator) |
| `ADMIN_API_KEY` | Selvvalgt tilfældig streng, mindst 32 tegn — bruges på `/admin` |

> **Del aldrig secrets i chat eller på Discord.** De lever kun i
> Cloudflare-dashboardet (og lokalt i `.dev.vars`, som er gitignored).

---

## Trin 6 — D1-databasen

Cloudflare-dashboard → **Storage & Databases → D1** → `fgcnord-db` → **Console**:

Kør migrationerne i `functions/migrations/` i rækkefølge (`0001`, `0002`,
`0003`) — kopiér indholdet af hver fil og kør det i konsollen.

---

## Trin 7 — Test-checkliste

1. Opret en testturnering på `/admin` → der skal dukke et opslag op i
   `#turneringer` **med ping af @Medlem**
2. Åbn `/t/<kode>` → "Tilmeld med Discord" → log ind → du står på listen
3. Sæt "Runde 1 starter" 20 min frem → check-in-knappen bliver aktiv
   15 min før → check ind → opslag i `#turneringer`
4. Start bracket fra `/admin` → 🔥-opslag med deltagerliste
5. Rapportér et kampresultat på bracket-siden → ⚔️-opslag
6. Test med en Discord-konto **uden** @Medlem-rollen → den skal få at vide,
   at medlemsrollen mangler (hvis `DISCORD_MEMBER_ROLE_ID` er sat)

---

## Fejlsøgning

| Symptom | Tjek |
| --- | --- |
| "Uventet svar fra serveren" på `/admin` | Secrets mangler i Cloudflare, eller siden kører på et statisk preview uden backend |
| Discord-login redirecter forkert | `DISCORD_REDIRECT_URI` matcher ikke redirect i Developer Portal (skal være præcis identisk) |
| "Mangler medlemsrollen" for alle | Server Members Intent slået til? Korrekt `DISCORD_GUILD_ID` / `DISCORD_MEMBER_ROLE_ID`? Bot inviteret til serveren? |
| Ingen opslag i `#turneringer` | `DISCORD_WEBHOOK_URL` korrekt? Webhook ikke slettet i Discord? |
| Ingen ping i opslag | `DISCORD_PING_ROLE_ID`/`DISCORD_MEMBER_ROLE_ID` sat? Ping sendes via webhook med `allowed_mentions`, så rollen behøver ikke være "mentionable" |

---

## Sikkerhed

- Alle database-kald bruger prepared statements — ingen SQL-injection.
- Admin-endpoints kræver `Authorization: Bearer <ADMIN_API_KEY>`.
- Session-cookies er HMAC-signerede og `HttpOnly`.
- Discord-pings er låst til én rolle via `allowed_mentions` — @everyone kan
  aldrig pinges gennem webhook'en.
- Nøglen på `/admin` gemmes kun i browserens sessionStorage og forsvinder,
  når tabben lukkes.
