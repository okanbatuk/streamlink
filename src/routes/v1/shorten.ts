import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";

function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

export function registerShortenRoute(app: FastifyInstance) {
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
