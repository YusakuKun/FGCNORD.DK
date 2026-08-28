/// <reference types="@cloudflare/workers-types" />

/**
 * Cloudflare Pages Function bindings og secrets.
 * DB bindes i wrangler.toml / Pages-dashboard, resten sættes som secrets.
 */
interface Env {
  /** D1-databasebinding (fgcnord-db) */
  DB: D1Database;
  /** Hemmelighed til at signere session-cookies */
  SESSION_SECRET: string;
  /** Admin-nøgle til beskyttede endpoints (fx opret turnering) */
  ADMIN_API_KEY: string;
  /** Discord OAuth2 */
  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET: string;
  DISCORD_REDIRECT_URI: string;
}
