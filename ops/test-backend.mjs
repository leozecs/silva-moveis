import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const commands = { generate: ["db:generate", "silva_checkout"], migrate: ["db:migrate"], seed: ["exec", "./src/scripts/seed-commerce-test.ts"], start: ["develop", "--port", "9010"] };
const command = commands[process.argv[2]];
if (!command) throw new Error("Use: node ops/test-backend.mjs migrate|seed|start");
const child = spawn(process.execPath, [resolve(root, "apps/backend/node_modules/@medusajs/cli/cli.js"), ...command], {
  cwd: resolve(root, "apps/backend"), stdio: "inherit",
  env: { ...process.env, PATH: `${dirname(process.execPath)}:${process.env.PATH ?? ""}`,
    NODE_ENV: "test", DATABASE_URL: "postgres://silva_test:local-isolated-test-only@127.0.0.1:55432/silva_commerce_test",
    REDIS_URL: "redis://127.0.0.1:56379", STORE_CORS: "http://localhost:3001", AUTH_CORS: "http://localhost:3001", ADMIN_CORS: "http://localhost:9010",
    JWT_SECRET: "isolated-test-jwt-secret", COOKIE_SECRET: "isolated-test-cookie-secret",
    MERCADOPAGO_ACCESS_TOKEN: "", MERCADOPAGO_WEBHOOK_SECRET: "", GOOGLE_CLIENT_ID: "", GOOGLE_CLIENT_SECRET: "", RESEND_API_KEY: "",
    MEDUSA_ADMIN_DISABLED: "true", SILVA_COMMERCE_TEST: "true",
  },
});
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
child.on("exit", (code) => { process.exitCode = code ?? 1; });
