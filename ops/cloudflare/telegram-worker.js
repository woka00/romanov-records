const TELEGRAM_API_ORIGIN = "https://api.telegram.org";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (!url.pathname.startsWith("/bot")) {
      return new Response("Not found", { status: 404 });
    }

    if (!env.RELAY_SECRET) {
      return new Response("Relay secret is not configured", { status: 500 });
    }

    if (request.headers.get("X-Romanov-Relay-Secret") !== env.RELAY_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }

    const headers = new Headers(request.headers);
    headers.delete("host");
    headers.delete("x-romanov-relay-secret");

    return fetch(TELEGRAM_API_ORIGIN + url.pathname + url.search, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
      redirect: "manual",
    });
  },
};
