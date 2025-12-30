import dotenv from "dotenv-safe";
dotenv.config({
  allowEmptyValues: true,
});

export const config = {
  port: Number(process.env.PORT || "3000"),
  host: process.env.HOST || "localhost",
  db: { url: process.env.DB_URL },
  redis: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT },
};
