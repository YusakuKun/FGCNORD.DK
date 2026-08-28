import { ApiContext, corsHeaders, error, getOrigin, handleError } from "../../lib/api";

function getRedirectUri(ctx: ApiContext): string {
  return (
    ctx.env.DISCORD_REDIRECT_URI ||
    `${new URL(ctx.request.url).origin}/api/auth/discord/callback`
  );
}

export async function onRequestGet(
  context: EventContext<Env, never, { ctx: ApiContext }>,
): Promise<Response> {
  const ctx = context.data.ctx;
  const origin = getOrigin(ctx.request);
  try {
    const clientId = ctx.env.DISCORD_CLIENT_ID;
    const clientSecret = ctx.env.DISCORD_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return error("Discord-login er ikke konfigureret.", 503, corsHeaders(origin));
    }

    const redirectUri = getRedirectUri(ctx);
    const state = crypto.randomUUID();

    const url = new URL("https://discord.com/oauth2/authorize");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("scope", "identify");
    url.searchParams.set("state", state);

    return Response.redirect(url.toString(), 302);
  } catch (err) {
    return handleError(err, origin);
  }
}

export async function onRequestOptions(
  context: EventContext<Env, never, { ctx: ApiContext }>,
): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(getOrigin(context.data.ctx.request)),
  });
}
