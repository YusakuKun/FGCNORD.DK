import { ApiContext, corsHeaders, getOrigin, handleError, json } from "../../lib/api";
import { destroySession } from "../../lib/session";

export async function onRequestPost(
  context: EventContext<Env, never, { ctx: ApiContext }>,
): Promise<Response> {
  const ctx = context.data.ctx;
  const origin = getOrigin(ctx.request);
  try {
    const token = ctx.data.session?.token;
    let cookie = "";
    if (token) {
      cookie = await destroySession(ctx.env.DB, token);
    } else {
      cookie = "fgc_session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax";
    }
    return json(
      { success: true },
      { headers: { "Set-Cookie": cookie, ...corsHeaders(origin) } },
    );
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
