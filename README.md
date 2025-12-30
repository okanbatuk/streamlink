# streamlink

> **Streaming-aware URL shortener** — Gracefully handles client disconnects, abort signals, and non-blocking analytics.

Built with:

- Fastify (streaming + lifecycle hooks)
- Node.js Web Streams API + AbortController
- PostgreSQL (Neon) + Redis
- Bun + esbuild (zero-config dev, fast build)

✅ `/shorten` — Create short links (6-char, collision-safe)  
🔜 `/id` — Streaming-aware redirect with real-time cleanup  
🔜 Async analytics (Redis counters + fire-and-forget logs)
