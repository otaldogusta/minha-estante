// Vercel Node.js serverless function
// Serves static assets from dist/client/ AND handles SSR via TanStack Start.

import { createReadStream, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const MIME_TYPES = {
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".css": "text/css",
  ".html": "text/html; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".map": "application/json",
  ".webp": "image/webp",
};

const STATIC_DIR = join(process.cwd(), "dist", "client");

export const config = { maxDuration: 30 };

let _server = null;
async function getServer() {
  if (!_server) {
    _server = (await import("../dist/server/server.js")).default;
  }
  return _server;
}

export default async function handler(req, res) {
  try {
    // Serve static files from dist/client/
    const urlPath = req.url.split("?")[0].split("#")[0];
    const staticPath = join(STATIC_DIR, urlPath);

    if (existsSync(staticPath) && statSync(staticPath).isFile()) {
      const ext = extname(staticPath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";
      res.setHeader("Content-Type", contentType);
      if (ext !== ".html") {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
      createReadStream(staticPath).pipe(res);
      return;
    }

    // SSR: call TanStack Start fetch handler
    const server = await getServer();

    const proto = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers["x-forwarded-host"] || req.headers["host"] || "localhost";
    const url = `${proto}://${host}${req.url}`;

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value != null && key.toLowerCase() !== "host") {
        headers.set(key, Array.isArray(value) ? value.join(",") : value);
      }
    }

    let body = null;
    if (req.method !== "GET" && req.method !== "HEAD") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      if (chunks.length > 0) body = Buffer.concat(chunks);
    }

    const request = new Request(url, {
      method: req.method,
      headers,
      body,
      duplex: body ? "half" : undefined,
    });

    const response = await server.fetch(request, {}, {});

    res.statusCode = response.status;
    for (const [key, value] of response.headers.entries()) {
      res.setHeader(key, value);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    res.end(buffer);
  } catch (err) {
    console.error("Vercel handler error:", err);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
}
