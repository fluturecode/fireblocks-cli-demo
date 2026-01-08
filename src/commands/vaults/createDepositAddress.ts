import { getFireblocks } from "@/lib/fireblocks";
import { parseArgs, usage } from "@/lib/cli";
import { printJson } from "@/lib/output";

async function main() {
  const fireblocks = getFireblocks();
  const { raw, positional } = parseArgs();

  const [vaultAccountId, assetId] = positional;

  if (!vaultAccountId || !assetId) {
    usage(
      [
        "Usage:",
        "  pnpm run create:deposit -- <vaultAccountId> <assetId> [--raw]",
        "",
        "Examples:",
        "  pnpm run create:deposit -- 0 ETH",
        "  pnpm run create:deposit -- 0 SOL",
        "  pnpm run create:deposit -- 0 MATIC_POLYGON",
      ].join("\n")
    );
  }

  const res = await fireblocks.vaults.createVaultAccountAssetAddress({
    vaultAccountId,
    assetId,
    // createAddressRequest is optional for many assets; keep minimal for demo
  });

  printJson(res.data, raw ? undefined : { truncate: true });
}

main().catch((e: any) => {
  const data = e?.response?.data ?? e;

  if (data?.code === 1010) {
    console.error(
      [
        "Error: Creating deposit addresses is not supported for this asset in this workspace (code 1010).",
        "Try one of these instead:",
        "  1) List existing addresses: pnpm run list:deposit -- <vaultId> <assetId>",
        "  2) Create the address in Fireblocks Console UI, then re-run list:deposit",
      ].join("\n")
    );
    process.exit(1);
  }

  console.error("Error:", data);
  process.exit(1);
});