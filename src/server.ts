import { createApp } from "./app.js";
import { createDependencies } from "./config/deps.js";
import { config } from "./config/env.js";
import { registerShutdownHandlers } from "./lib/shutdown.js";

const deps = await createDependencies();
registerShutdownHandlers(deps);

const app = createApp(deps);

export async function start() {
	const { PORT, HOST } = config;
	await app.listen({ port: PORT, host: HOST });
	console.log(`🚀 Server running on http://${HOST}:${PORT}`);
}

if (import.meta.main) {
	start().catch(async (err) => {
		app.log.error(err);
		await app.close();
		process.exit(1);
	});
}
