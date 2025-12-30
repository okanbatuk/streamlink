// src/server.ts
import { createApp } from "./app.js";
import { config } from "./config/env.js";
import { createDependencies } from "./config/deps.js";
import { registerShutdownHandlers } from "./lib/shutdown.js";

const deps = createDependencies();
registerShutdownHandlers(deps);

const app = createApp(deps);

const start = async () => {
  try {
    const { port, host } = config;
    await app.listen({ port, host });
    console.log(`🚀 Server running on http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  start();
}

export { app, start };
