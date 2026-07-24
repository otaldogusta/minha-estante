// Vercel Node.js serverless function — adapts the CF Workers fetch handler
// to standard Node.js HTTP (req, res).
//
// Static assets (dist/client/) are served by Vercel's CDN when the project's
// "Output Directory" is set to "dist/client" in Vercel project settings.
// This handler only handles SSR requests.

export const config = {
  maxDuration: 30,
};

let _server = null;

async function getServer() {
  if (!_server) {
    _server = (await import("../dist/server/server.js")).default;
  }
  return _server;
}

export default async function handler(req, res) {
  try {
    const server = await getServer();

    // Build URL
    const proto = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers["x-forwarded-host"] || req.headers["host"] || "localhost";
    const url = `${proto}://${host}${req.url}`;

    // Build headers
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value != null && key.toLowerCase() !== "host") {
        headers.set(key, Array.isArray(value) ? value.join(",") : value);
      }
    }

    // Read body
    let body = null;
    if (req.method !== "GET" && req.method !== "HEAD") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      if (chunks.length > 0) {
        body = Buffer.concat(chunks);
      }
    }

    // Call TanStack Start fetch handler (CF Workers style)
    const request = new Request(url, {
      method: req.method,
      headers,
      body,
      duplex: body ? "half" : undefined,
    });

    const response = await server.fetch(request, {}, {});

    // Write response
    res.statusCode = response.status;
    let hasCacheControl = false;
    for (const [key, value] of response.headers.entries()) {
      if (key.toLowerCase() === "cache-control") hasCacheControl = true;
      res.setHeader(key, value);
    }

    if (req.method === "GET" && !hasCacheControl && response.status === 200) {
      res.setHeader("Cache-Control", "public, s-maxage=5, stale-while-revalidate=59");
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    res.end(buffer);
  } catch (err) {
    console.error("Vercel handler error:", err);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
}
