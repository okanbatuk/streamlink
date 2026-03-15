import Fastify, { type FastifyInstance } from "fastify";
import type { InfraDeps } from "./config/deps.js";
import { config } from "./config/env.js";
import { registerRedirectRoute } from "./v1/routes/redirect.js";
import { registerShortenRoute } from "./v1/routes/shorten.js";

export function createApp(deps: InfraDeps): FastifyInstance {
	const app = Fastify({
		logger: {
			level: config.LOG_LEVEL,
		},
		disableRequestLogging: config.NODE_ENV === "production",
	});

	app.decorate("db", deps.db);
	if (deps.redis) app.decorate("redis", deps.redis);

	app.register(
		async (v1) => {
			registerShortenRoute(v1);
			registerRedirectRoute(v1);
		},
		{ prefix: "/v1" },
	);

	app.get("/health", async () => ({
		ok: true,
		timestamp: new Date().toISOString(),
	}));

	return app;
}
