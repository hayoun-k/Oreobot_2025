/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/register") {
      const body = await request.json();
      const { userId, ign, jobClass, level, world } = body;

      if (!userId || !ign || !jobClass || !world) {
        return new Response(JSON.stringify({ error: "Missing fields" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      const userData = {
        ign,
        jobClass,
        level: Number(level),
        world,
        timestamp: new Date().toISOString()
      };

      await env.MEMBERS_KV.put(`user:${userId}`, JSON.stringify(userData));

      return new Response(JSON.stringify({ success: true, user: userData }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    if (request.method === "GET" && url.pathname.startsWith("/profile/")) {
      const userId = url.pathname.split("/")[2];
      const data = await env.MEMBERS_KV.get(`user:${userId}`);

      if (!data) {
        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }

      return new Response(data, {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response("Not found", { status: 404 });
  }
};
