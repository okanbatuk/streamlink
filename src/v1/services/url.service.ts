import { nanoid } from "nanoid";
import type { Pool } from "pg";
import type { Logger } from "../../types/logger.js";
import type { CreateUrlResponse } from "../../types/url.js";

export class UrlService {
	constructor(
		private db: Pool,
		private logger: Logger,
	) {}

	private async generateUniqueId(originalUrl: string): Promise<string> {
		const id = nanoid(6);

		try {
			await this.db.query(
				`INSERT INTO urls (id, target_url, created_at, click_count)
         VALUES ($1, $2, NOW(), 0)`,
				[id, originalUrl],
			);
			return id;
		} catch (err: unknown) {
			this.logger.error({ url: originalUrl, err }, "Failed to insert URL");
			throw new Error("Database insertion failed");
		}
	}

	async createShortUrl(
		originalUrl: string,
		baseUrl: string,
	): Promise<CreateUrlResponse> {
		try {
			const id = await this.generateUniqueId(originalUrl);

			return {
				id,
				shortUrl: `${baseUrl}/${id}`,
				originalUrl,
			};
		} catch (err: unknown) {
			this.logger.error({ url: originalUrl, err }, "Failed to shorten URL");
			throw new Error("Failed to create short link");
		}
	}
}
