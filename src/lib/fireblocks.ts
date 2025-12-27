import "dotenv/config";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { Fireblocks } from "@fireblocks/ts-sdk";

export function getFireblocks() {
  const apiKey = process.env.FIREBLOCKS_API_KEY?.trim();
  const secretPathRaw = process.env.FIREBLOCKS_SECRET_PATH?.trim();
  const baseHostRaw = process.env.FIREBLOCKS_BASE_PATH?.trim();

  if (!apiKey) throw new Error("Missing FIREBLOCKS_API_KEY in .env");
  if (!secretPathRaw) throw new Error("Missing FIREBLOCKS_SECRET_PATH in .env");
  if (!baseHostRaw) throw new Error("Missing FIREBLOCKS_BASE_PATH in .env");

  // Make secret path work from any working directory
  const secretPath = path.resolve(process.cwd(), secretPathRaw);

  if (!existsSync(secretPath)) {
    throw new Error(`Secret key not found at: ${secretPath}`);
  }

  const secretKey = readFileSync(secretPath, "utf8");

  // Repo standard: env holds host only; code appends /v1
  const baseHost = baseHostRaw.replace(/\/+$/, "");
  const basePath = baseHost.endsWith("/v1") ? baseHost : `${baseHost}/v1`;

  return new Fireblocks({
    apiKey,
    secretKey,
    basePath,
  });
}