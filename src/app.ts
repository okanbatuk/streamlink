import Fastify, { type FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import type { InfraDeps } from "./config/deps.js";
import { config } from "./config/env.js";

function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

function registerShortenRoute(app: FastifyInstance) {
  app.post<{ Body: { url: string } }>(
    "/shorten",
    async function (request, reply) {
      const { url } = request.body;

      // 1. Validation
      if (!url || typeof url !== "string" || !isValidUrl(url)) {
        return reply
          .code(400)
          .send({ error: "Invalid 'url' field. Must be a valid URL." });
      }

      // 2. Generate a short ID
      const id = nanoid(6);

      // 3. Add to DB
      try {
        const result = await this.db.query(
          `INSERT INTO urls (id, target_url, created_at, click_count)
         VALUES ($1, $2, NOW(), 0)
         ON CONFLICT (id) DO NOTHING
         RETURNING id`,
          [id, url],
        );

        // If there was an ID conflict, try again
        if (result.rows.length === 0) {
          const id2 = nanoid(6);
          const result2 = await this.db.query(
            `INSERT INTO urls (id, target_url, created_at, click_count)
           VALUES ($1, $2, NOW(), 0)
           ON CONFLICT (id) DO NOTHING
           RETURNING id`,
            [id2, url],
          );
          if (result2.rows.length === 0) {
            this.log.warn(
              { url },
              "ID collision twice — falling back to longer ID",
            );
            const id3 = nanoid(8);
            await this.db.query(
              `INSERT INTO urls (id, target_url, created_at, click_count)
             VALUES ($1, $2, NOW(), 0)`,
              [id3, url],
            );
            const shortUrl = `${request.protocol}://${request.hostname}/${id3}`;
            return reply
              .code(201)
              .send({ id: id3, shortUrl, originalUrl: url });
          }
          const shortUrl = `${request.protocol}://${request.hostname}/${id2}`;
          return reply.code(201).send({ id: id2, shortUrl, originalUrl: url });
        }

        const shortUrl = `${request.protocol}://${request.hostname}/${id}`;
        return reply.code(201).send({ id, shortUrl, originalUrl: url });
      } catch (err: unknown) {
        this.log.error({ url, err }, "Failed to shorten URL");
        return reply.code(500).send({ error: "Failed to create short link" });
      }
    },
  );
}

function registerRedirectRoute(app: FastifyInstance) {
  app.get<{ Params: { id: string } }>("/:id", async function (request, reply) {
    const { id } = request.params;

    const result = await this.db.query(
      ` UPDATE urls
        SET click_count = click_count + 1
        WHERE id = $1
        RETURNING target_url`,
      [id],
    );

    if (result.rows.length === 0) {
      return reply.code(404).send({ error: "Short link not found" });
    }

    const { target_url } = result.rows[0];

    // 2. Redirect (Fastify native)
    return reply.redirect(target_url, 302);
  });
}

export function createApp(deps: InfraDeps): FastifyInstance {
  const app = Fastify({
    logger: {
      level: config.LOG_LEVEL,
    },
    disableRequestLogging: config.NODE_ENV === "production",
  });

  app.decorate("db", deps.db);
  if (deps.redis) app.decorate("redis", deps.redis);

  registerShortenRoute(app);
  registerRedirectRoute(app);

  app.get("/health", async () => ({
    ok: true,
    timestamp: new Date().toISOString(),
  }));

  return app;
}
