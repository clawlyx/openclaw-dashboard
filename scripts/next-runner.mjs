import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { parseEnv } from "node:util";

const cwd = process.cwd();
const command = process.argv[2] || "dev";
const passthroughArgs = process.argv.slice(3);

const readEnvFile = (filename) => {
  const filePath = path.join(cwd, filename);
  if (!fs.existsSync(filePath)) return {};
  return parseEnv(fs.readFileSync(filePath, "utf8"));
};

const fileEnv = {
  ...readEnvFile(".env"),
  ...readEnvFile(".env.local")
};

const mergedEnv = {
  ...fileEnv,
  ...process.env
};

let host = mergedEnv.DASHBOARD_HOST?.trim() || mergedEnv.HOST?.trim() || "127.0.0.1";
let port = mergedEnv.DASHBOARD_PORT?.trim() || mergedEnv.PORT?.trim() || "3000";

const configuredUrl = mergedEnv.DASHBOARD_URL?.trim();
if (configuredUrl) {
  try {
    const parsedUrl = new URL(
      configuredUrl.includes("://") ? configuredUrl : `http://${configuredUrl}`
    );
    host = parsedUrl.hostname || host;
    port = parsedUrl.port || port;
    mergedEnv.NEXT_PUBLIC_APP_URL = mergedEnv.NEXT_PUBLIC_APP_URL || parsedUrl.origin;
  } catch (error) {
    console.error(`Invalid DASHBOARD_URL: ${configuredUrl}`);
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

mergedEnv.HOST = host;
mergedEnv.HOSTNAME = host;
mergedEnv.PORT = port;

const nextBin = path.join(cwd, "node_modules", "next", "dist", "bin", "next");
if (!fs.existsSync(nextBin)) {
  console.error("Next.js binary not found. Run `pnpm install` first.");
  process.exit(1);
}

const nextArgs = [nextBin, command];
if (command !== "build") {
  nextArgs.push("-H", host, "-p", port);
}
nextArgs.push(...passthroughArgs);

const child = spawn(process.execPath, nextArgs, {
  cwd,
  env: mergedEnv,
  stdio: "inherit"
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
