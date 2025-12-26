import { getFireblocks } from "../lib/fireblocks";

async function main() {
  const fireblocks = getFireblocks();   

  // Accept both: `pnpm run list:deposit 0 ETH` and `pnpm run list:deposit -- 0 ETH`
  const args = process.argv.slice(2).filter((a) => a !== "--");
  const [vaultAccountId, assetId] = args;

  if (!vaultAccountId || !assetId) {
    throw new Error("Usage: pnpm run list:deposit <vaultAccountId> <assetId>");
  }
  // Helpful when debugging CLI issues:
  // console.log(`Listing deposit addresses for vault=${vaultAccountId} asset=${assetId}`);

  const res = await fireblocks.vaults.getVaultAccountAssetAddressesPaginated({
    vaultAccountId,
    assetId,
    limit: 50,
    // after: undefined, // optionally use for pagination
    // before: undefined,
  });

  console.log(JSON.stringify(res.data, null, 2));
}

main().catch((e: any) => {
  console.error("Error:", e?.response?.data ?? e);
  process.exit(1);
});
