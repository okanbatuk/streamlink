import type { FastifyInstance } from "fastify";

export function registerRedirectRoute(app: FastifyInstance) {
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
