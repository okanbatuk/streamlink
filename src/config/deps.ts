import { Pool } from "pg";
import { Redis } from "ioredis";
import { config } from "./env.js";

export interface Dependencies {
  db: Pool;
  redis: Redis;
}

export function createDependencies(): Dependencies {
  const db = new Pool({
    connectionString: config.db.url,
    ssl: { rejectUnauthorized: false },
    idleTimeoutMillis: 30_000,
    max: 10,
  });

  const redis = new Redis({
    host: config.redis.host ?? "localhost",
    port: Number(config.redis.port) ?? 6379,
    retryStrategy: (times) => Math.min(times * 50, 2000),
  });

  return { db, redis };
}
