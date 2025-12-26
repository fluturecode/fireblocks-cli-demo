import { getFireblocks } from "../lib/fireblocks";

async function main() {
  const fireblocks = getFireblocks();

  const vaultAccountId = process.argv[2];
  const assetId = process.argv[3];

  if (!vaultAccountId || !assetId) {
    throw new Error("Usage: pnpm run list:deposit -- <vaultAccountId> <assetId>");
  }

  const res = await fireblocks.vaults.getVaultAccountAssetAddressesPaginated({
    vaultAccountId,
    assetId,
    limit: 50,
  });

  console.log(JSON.stringify(res.data, null, 2));
}

main().catch((e: any) => {
  console.error("Error:", e?.response?.data ?? e);
  process.exit(1);
});
