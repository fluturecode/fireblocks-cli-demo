import { getFireblocks } from "../lib/fireblocks";
import { parseArgs, usage } from "../lib/cli";
import { printJson } from "../lib/output";

async function main() {
  const fireblocks = getFireblocks();
  const { raw, positional, flags } = parseArgs();

  const [vaultAccountId, assetId] = positional;

  if (!vaultAccountId || !assetId) {
    usage(
      [
        "Usage:",
        "  pnpm run list:deposit -- <vaultAccountId> <assetId> [--limit 50] [--raw]",
        "",
        "Examples:",
        "  pnpm run list:deposit -- 0 ETH",
        "  pnpm run list:deposit -- 0 SOL",
        "  pnpm run list:deposit -- 0 MATIC_POLYGON",
        "  pnpm run list:deposit -- 0 ETH --limit 10",
      ].join("\n")
    );
  }

  const limit = typeof flags.limit === "string" ? Number(flags.limit) : 50;
  if (!Number.isFinite(limit) || limit <= 0) {
    usage("Invalid --limit. Example: --limit 50");
  }

  const res = await fireblocks.vaults.getVaultAccountAssetAddressesPaginated({
    vaultAccountId,
    assetId,
    limit,
  });

  // Default: truncate huge strings; --raw shows full payload
  printJson(res.data, raw ? undefined : { truncate: true });
}

main().catch((e: any) => {
  console.error("Error:", e?.response?.data ?? e);
  process.exit(1);
});