import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { isValidUrl } from "../../lib/validation.js";
import type { CreateUrlRequest } from "../../types/url.js";
import { UrlService } from "./../services/url.service.js";

export function registerShortenRoute(app: FastifyInstance) {
	const urlService = new UrlService(app.db, app.log);

	app.post<{ Body: CreateUrlRequest }>(
		"/shorten",
		async (
			request: FastifyRequest<{ Body: CreateUrlRequest }>,
			reply: FastifyReply,
		) => {
			const { url } = request.body;

			if (!url || typeof url !== "string" || !isValidUrl(url)) {
				return reply
					.code(400)
					.send({ error: "Invalid 'url' field. Must be a valid URL." });
			}

			try {
				const baseUrl = `${request.protocol}://${request.hostname}`;
				const result = await urlService.createShortUrl(url, baseUrl);
				return reply.code(201).send(result);
			} catch (err: unknown) {
				app.log.error(err);
				return reply.code(500).send({ error: "Internal Server Error" });
			}
		},
	);
}
