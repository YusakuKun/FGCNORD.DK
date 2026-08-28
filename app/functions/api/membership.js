/**
 * Cloudflare Pages Function: modtag medlemstilmeldinger og send til Discord webhook.
 *
 * Environment variables (i Cloudflare Pages dashboard):
 * - DISCORD_WEBHOOK_URL: webhook URL til #medlemmer eller lign. kanal
 *
 * Bemærk: Denne function kører kun når sitet hostes på Cloudflare Pages.
 * Under lokal udvikling med Vite kører functionen ikke — frontend falder tilbage
 * til demo-mode (viser success-besked uden at sende data).
 */

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const origin = request.headers.get("Origin") || "";

  try {
    const body = await request.json();
    const { name, email, gamertag, game, tier } = body;

    // Validering
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: "Navn er påkrævet og skal være mindst 2 tegn." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "En gyldig email er påkrævet." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } }
      );
    }

    if (!tier || typeof tier !== "string") {
      return new Response(
        JSON.stringify({ error: "Vælg et medlemskab." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } }
      );
    }

    const gameLabels = {
      ultimate: "Super Smash Bros. Ultimate",
      melee: "Super Smash Bros. Melee",
      roa2: "Rivals of Aether 2",
      other: "Andet / flere spil",
    };

    const payload = {
      content: "Ny medlemstilmelding!",
      embeds: [
        {
          title: tier,
          color: 0xa84434,
          fields: [
            { name: "Navn", value: name.trim(), inline: true },
            { name: "Email", value: email.trim(), inline: true },
            { name: "Gamertag", value: gamertag?.trim() || "Ikke angivet", inline: true },
            { name: "Primært spil", value: gameLabels[game] || game || "Ikke angivet", inline: true },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const webhookUrl = env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      return new Response(
        JSON.stringify({ error: "Serverkonfiguration mangler: DISCORD_WEBHOOK_URL er ikke sat." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } }
      );
    }

    const discordResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text();
      console.error("Discord webhook fejl:", errorText);
      return new Response(
        JSON.stringify({ error: "Kunne ikke sende til Discord. Prøv igen senere." }),
        { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Tilmelding modtaget." }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } }
    );
  } catch (err) {
    console.error("Membership function fejl:", err);
    return new Response(
      JSON.stringify({ error: "Der opstod en uventet fejl. Prøv igen senere." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } }
    );
  }
}

export async function onRequestOptions(context) {
  const origin = context.request.headers.get("Origin") || "";
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}
