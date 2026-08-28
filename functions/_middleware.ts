import type { ApiContext } from "./lib/api";
import { readSession } from "./lib/session";

export async function onRequest(context: EventContext<Env, string, unknown>) {
  const ctx: ApiContext = {
    request: context.request,
    env: context.env as unknown as ApiContext["env"],
    params: context.params as Record<string, string>,
    data: {},
  };

  try {
    const { session, player } = await readSession(
      context.request,
      ctx.env.DB,
      ctx.env.SESSION_SECRET,
    );
    ctx.data.session = session;
    ctx.data.player = player;
  } catch (err) {
    console.error("Session middleware error:", err);
    ctx.data.session = null;
    ctx.data.player = null;
  }

  (context.data as { ctx: ApiContext }).ctx = ctx;
  return await context.next();
}
