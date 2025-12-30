import { Dependencies as Deps } from "../config/deps.js";

let isShuttingDown = false;

export function registerShutdownHandlers(deps: Deps) {
  const cleanup = async () => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log("🔁 Shutting down gracefully...");
    await Promise.allSettled([
      deps.redis.quit().catch(ignoreExpectedErrors),
      deps.db.end().catch(ignoreExpectedErrors),
    ]);
    console.log("✅ Clean shutdown complete.");
    process.exit(0);
  };

  process.once("SIGINT", cleanup);
  process.once("SIGTERM", cleanup);
}

function ignoreExpectedErrors(err: unknown) {
  const msg = (err as Error)?.message || "";
  if (!msg.includes("more than once") && !msg.includes("ending")) {
    console.error(err);
  }
}
