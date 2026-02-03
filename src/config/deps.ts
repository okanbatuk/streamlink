import { Redis } from "ioredis";
import { Pool } from "pg";
import { config } from "./env.js";

export interface InfraDeps {
  db: Pool;
  redis?: Redis;
}

export type Dependencies = InfraDeps;

export async function createDependencies(): Promise<Dependencies> {
  const db = new Pool({
    connectionString: config.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    idleTimeoutMillis: 30_000,
    max: 10,
  });

  await db.query("SELECT 1");

  let redis: Redis | undefined;

  if (config.REDIS_ENABLED) {
    redis = new Redis({
      host: config.REDIS_HOST ?? "localhost",
      port: Number(config.REDIS_PORT) ?? 6379,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });

    await redis.ping();
  }

  return { db, redis };
}
