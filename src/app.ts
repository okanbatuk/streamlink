import Fastify, { type FastifyInstance } from "fastify";
import { Dependencies } from "./config/deps.js";

export function createApp(deps: Dependencies): FastifyInstance {
  const app = Fastify({
    logger: true,
    disableRequestLogging: false,
  });

  app.decorate("db", deps.db);
  app.decorate("redis", deps.redis);

  app.get("/health", async () => ({
    ok: true,
    timestamp: new Date().toISOString(),
  }));

  // TODO: Register routes shortener and redirect

  return app;
}
