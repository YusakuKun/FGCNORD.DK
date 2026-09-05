#!/usr/bin/env node
/**
 * FGC Nord — Discord server-setup
 *
 * Køres lokalt af en admin. Token deles ALDRIG i chat eller commit'es —
 * det læses fra miljøvariablen DISCORD_BOT_TOKEN.
 *
 *   DISCORD_BOT_TOKEN=xxx node scripts/setup-discord.mjs
 *
 * Botten skal være inviteret til serveren med permissions:
 *   Manage Roles, Manage Channels, Manage Webhooks
 *
 * Scriptet er idempotent: eksisterende roller/kanaler genbruges (match på navn).
 * Til sidst printes de værdier, der skal ind som secrets i Cloudflare:
 *   DISCORD_GUILD_ID, DISCORD_MEMBER_ROLE_ID, DISCORD_PING_ROLE_ID,
 *   DISCORD_WEBHOOK_URL
 */

const TOKEN = process.env.DISCORD_BOT_TOKEN;
if (!TOKEN) {
  console.error("Mangler DISCORD_BOT_TOKEN miljøvariabel.");
  process.exit(1);
}

const API = "https://discord.com/api/v10";
const headers = {
  Authorization: `Bot ${TOKEN}`,
  "Content-Type": "application/json",
};

async function api(path, opts = {}) {
  const res = await fetch(`${API}${path}`, { headers, ...opts });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`${opts.method ?? "GET"} ${path} → ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9æøå]/g, "");

async function main() {
  // 1. Find guild (botten er kun på vores ene server)
  const guilds = await api("/users/@me/guilds");
  if (!Array.isArray(guilds) || guilds.length === 0) {
    throw new Error("Botten er ikke på nogen server. Inviter den først.");
  }
  const guild = guilds[0];
  console.log(`Server: ${guild.name} (${guild.id})`);

  // 2. Roller — find eller opret
  const existingRoles = await api(`/guilds/${guild.id}/roles`);
  async function ensureRole(name, color) {
    const found = existingRoles.find((r) => norm(r.name) === norm(name));
    if (found) {
      console.log(`Rolle findes: ${name} (${found.id})`);
      return found;
    }
    const created = await api(`/guilds/${guild.id}/roles`, {
      method: "POST",
      body: JSON.stringify({ name, color, mentionable: true, hoist: true }),
    });
    console.log(`Rolle oprettet: ${name} (${created.id})`);
    return created;
  }

  const medlem = await ensureRole("Medlem", 0x00aeef);
  const weeklyPing = await ensureRole("Weekly-ping", 0x4fc3f7);
  await ensureRole("Crew", 0x51512a);
  await ensureRole("TO", 0xf4f8fb);

  // 3. Kanaler — find eller opret
  const channels = await api(`/guilds/${guild.id}/channels`);
  async function ensureChannel(name, type, parentId) {
    const found = channels.find(
      (c) => c.type === type && norm(c.name) === norm(name) && (parentId ? c.parent_id === parentId : true),
    );
    if (found) {
      console.log(`Kanal findes: #${name} (${found.id})`);
      return found;
    }
    const created = await api(`/guilds/${guild.id}/channels`, {
      method: "POST",
      body: JSON.stringify({ name, type, parent_id: parentId ?? undefined }),
    });
    console.log(`Kanal oprettet: #${name} (${created.id})`);
    return created;
  }

  // type 0 = tekst, 4 = kategori
  await ensureChannel("turnering-webhook", 0);
  for (const game of ["Melee", "Ultimate", "Rivals of Aether 2"]) {
    const cat = await ensureChannel(game, 4);
    const chanName = norm(game) === norm("Rivals of Aether 2") ? "roa2" : game.toLowerCase();
    await ensureChannel(`${chanName}-finder`, 0, cat.id);
  }

  // 4. Webhook til #turnering-webhook (bruges af sitet til event-opslag)
  const webhookChan = channels.find((c) => c.type === 0 && norm(c.name) === norm("turnering-webhook"));
  let webhookUrl = "";
  if (webhookChan) {
    const hooks = await api(`/channels/${webhookChan.id}/webhooks`);
    let hook = Array.isArray(hooks) ? hooks.find((h) => h.name === "FGC Nord") : null;
    if (!hook) {
      hook = await api(`/channels/${webhookChan.id}/webhooks`, {
        method: "POST",
        body: JSON.stringify({ name: "FGC Nord" }),
      });
      console.log(`Webhook oprettet i #turnering-webhook (${hook.id})`);
    } else {
      console.log(`Webhook findes: FGC Nord (${hook.id})`);
    }
    webhookUrl = `https://discord.com/api/webhooks/${hook.id}/${hook.token}`;
  }

  // 5. Print Cloudflare-secrets
  console.log("\n=== Sæt disse som secrets i Cloudflare (Workers & Pages → fgcnord → Settings → Variables and Secrets) ===");
  console.log(`DISCORD_GUILD_ID        = ${guild.id}`);
  console.log(`DISCORD_MEMBER_ROLE_ID  = ${medlem.id}`);
  console.log(`DISCORD_PING_ROLE_ID    = ${weeklyPing.id}`);
  if (webhookUrl) console.log(`DISCORD_WEBHOOK_URL     = ${webhookUrl}`);
  console.log("\nHusk: Retry deployment bagefter, så secrets bliver aktive.");
}

main().catch((err) => {
  console.error("Fejl:", err.message);
  process.exit(1);
});
