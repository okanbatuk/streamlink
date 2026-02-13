import dotenv from "dotenv-safe";
import { z } from "zod";

dotenv.config({
  allowEmptyValues: true,
});

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default("0.0.0.0"),
  NODE_ENV: z.string().default("development"),
  DATABASE_URL: z.url(),
  REDIS_ENABLED: z
    .enum(["0", "1", "true", "false"])
    .transform((value) => value === "1" || value === "true")
    .default(false),
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const errorMessages = z.treeifyError(parsed.error);
  console.error("Invalid environment variables:");
  console.error(errorMessages);
  process.exit(1);
}

export const config = parsed.data;
