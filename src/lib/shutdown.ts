import type { InfraDeps } from "../config/deps.js";

let isShuttingDown = false;

export function registerShutdownHandlers(deps: InfraDeps) {
  const shutdown = async () => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log("🛑 Shutting down...");

    try {
      await deps.db.end();
    } catch (err) {
      console.error("DB shutdown error:", err);
    }

    if (deps.redis) {
      try {
        await deps.redis.quit();
      } catch (err) {
        console.error("Redis shutdown error:", err);
      }
    }

    console.log("✅ Shutdown complete");
    process.exit(0);
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}
