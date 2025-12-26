import 'dotenv/config';
import { readFileSync, existsSync } from 'node:fs';
import { Fireblocks, BasePath } from '@fireblocks/ts-sdk';

const apiKey = process.env.FIREBLOCKS_API_KEY;
const secretPath = process.env.FIREBLOCKS_SECRET_PATH;
const basePathEnv = process.env.FIREBLOCKS_BASE_PATH;

if (!apiKey) throw new Error('Missing FIREBLOCKS_API_KEY in .env');
if (!secretPath) throw new Error('Missing FIREBLOCKS_SECRET_PATH in .env');
if (!existsSync(secretPath)) throw new Error(`Secret key not found at: ${secretPath}`);

// Choose basePath:
// - easiest: use BasePath.Sandbox for sandbox
// - or set FIREBLOCKS_BASE_PATH to the full /v1 URL
const basePath =
  basePathEnv?.includes('sandbox') ? BasePath.Sandbox : (basePathEnv as any);

const fireblocks = new Fireblocks({
  apiKey,
  secretKey: readFileSync(secretPath, 'utf8'),
  basePath, // e.g. BasePath.Sandbox or "https://sandbox-api.fireblocks.io/v1"
});

async function main() {
  const vaults = await fireblocks.vaults.getPagedVaultAccounts({ limit: 5 });
  console.log(JSON.stringify(vaults.data, null, 2));
}

main().catch((e: any) => {
  console.error('Error:', e?.response?.data ?? e);
  process.exit(1);
});
