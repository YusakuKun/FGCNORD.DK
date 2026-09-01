/**
 * Discord-integration via webhook.
 * Poster embeds til fællesskabets Discord-kanal, når der sker noget i en
 * turnering: tilmeldinger, check-ins, bracket-start og kampresultater.
 *
 * Kræver env-secret DISCORD_WEBHOOK_URL (Server Settings → Integrations →
 * Webhooks → Copy Webhook URL).
 */

import type { Env } from "./api";

export interface DiscordEmbed {
  title: string;
  description?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  url?: string;
  footer?: { text: string };
  timestamp?: string;
}

/** FGC Nord-farver som Discord embed-farver */
export const DISCORD_COLORS = {
  brick: 0x00aeef, // tilmelding / info
  emerald: 0x34d399, // check-in / bekræftet
  melee: 0xe57373,
  coal: 0x0a1e3c, // bracket live
  gold: 0xfbbf24, // resultat
} as const;

const gameLabels: Record<string, string> = {
  melee: "Melee",
  ultimate: "Ultimate",
  roa2: "Rivals of Aether 2",
};

export function gameLabel(game: string): string {
  return gameLabels[game] ?? game;
}

/**
 * Post et embed til Discord. Fejler stille (logger kun) — Discord må aldrig
 * kunne nedbryde turneringsflowet.
 */
export async function notifyDiscord(
  env: Env,
  embed: DiscordEmbed,
): Promise<void> {
  const webhook = env.DISCORD_WEBHOOK_URL;
  if (!webhook) return;
  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "FGC Nord Bracket",
        embeds: [
          {
            ...embed,
            color: embed.color ?? DISCORD_COLORS.brick,
            timestamp: embed.timestamp ?? new Date().toISOString(),
          },
        ],
      }),
    });
  } catch (err) {
    console.error("Discord webhook fejlede:", err);
  }
}

/** Link til turneringssiden (bruges i embeds) */
export function tournamentUrl(request: Request, code: string): string {
  const origin = new URL(request.url).origin;
  return `${origin}/t/${encodeURIComponent(code)}`;
}

export function bracketUrl(request: Request, code: string): string {
  const origin = new URL(request.url).origin;
  return `${origin}/t/${encodeURIComponent(code)}/bracket`;
}
