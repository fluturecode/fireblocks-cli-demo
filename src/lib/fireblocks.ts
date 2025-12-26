import "dotenv/config";
import { readFileSync, existsSync } from "node:fs";
import { Fireblocks } from "@fireblocks/ts-sdk";

export function getFireblocks() {
  const apiKey = process.env.FIREBLOCKS_API_KEY;
  const secretPath = process.env.FIREBLOCKS_SECRET_PATH
  const basePath = process.env.FIREBLOCKS_BASE_PATH;

  if (!apiKey) throw new Error("Missing FIREBLOCKS_API_KEY in .env");
  if (!secretPath) throw new Error("Missing FIREBLOCKS_SECRET_PATH in .env");
  if (!basePath) throw new Error("Missing FIREBLOCKS_BASE_PATH in .env");
  if (!existsSync(secretPath)) throw new Error(`Secret key not found at: ${secretPath}`);

  const secretKey = readFileSync(secretPath, "utf8");

  return new Fireblocks({
    apiKey,
    secretKey,
    basePath, // e.g. https://api.fireblocks.io/v1
  });
}
