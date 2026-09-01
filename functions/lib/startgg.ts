/**
 * start.gg GraphQL-klient.
 * Token ligger som secret (STARTGG_API_TOKEN) og forlader aldrig serveren.
 * Docs: https://developer.start.gg/docs/intro/
 */

import type { Env } from "./api";
import { ResponseError } from "./api";

const STARTGG_API = "https://api.start.gg/gql/alpha";

interface StartggResponse<T> {
  data?: T;
  errors?: { message: string }[];
  success?: boolean;
  message?: string;
}

/** Er STARTGG_API_TOKEN sat som secret? */
export function startggConfigured(env: Env): boolean {
  return !!env.STARTGG_API_TOKEN;
}

/**
 * Kør en GraphQL-forespørgsel mod start.gg.
 * Kaster ResponseError med dansk fejlbesked ved netværks-/API-fejl.
 */
export async function startggQuery<T>(
  env: Env,
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const token = env.STARTGG_API_TOKEN;
  if (!token) {
    throw new ResponseError(
      "start.gg-integrationen er ikke sat op endnu (mangler STARTGG_API_TOKEN).",
      503,
    );
  }

  let res: Response;
  try {
    res = await fetch(STARTGG_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query, variables }),
    });
  } catch {
    throw new ResponseError("Kunne ikke nå start.gg. Prøv igen om lidt.", 502);
  }

  const data = (await res.json().catch(() => null)) as StartggResponse<T> | null;
  if (!data) {
    throw new ResponseError(`Uventet svar fra start.gg (HTTP ${res.status}).`, 502);
  }
  // Rate limit og lignende globale fejl
  if (data.success === false && data.message) {
    throw new ResponseError(`start.gg: ${data.message}`, 502);
  }
  if (data.errors && data.errors.length > 0) {
    throw new ResponseError(`start.gg: ${data.errors[0].message}`, 502);
  }
  if (!data.data) {
    throw new ResponseError("Tomt svar fra start.gg.", 502);
  }
  return data.data;
}

/**
 * Normalisér en start.gg event-slug.
 * Accepterer både "tournament/x/event/y" og en fuld URL
 * ("https://start.gg/tournament/x/event/y").
 */
export function normalizeEventSlug(input: string): string {
  let slug = input.trim();
  slug = slug.replace(/^https?:\/\/(www\.)?start\.gg\//i, "");
  slug = slug.replace(/^\/+|\/+$/g, "");
  if (!slug.startsWith("tournament/")) {
    slug = `tournament/${slug}`;
  }
  return slug;
}

/** Map start.gg-videospilsnavne til vores interne spilnøgler. */
export function mapVideogame(name: string | null | undefined): string | null {
  if (!name) return null;
  const n = name.toLowerCase();
  if (n.includes("ultimate")) return "ultimate";
  if (n.includes("melee")) return "melee";
  if (n.includes("rivals")) return "roa2";
  return null;
}
