import { getFireblocks } from "../lib/fireblocks";

async function main() {
  const fireblocks = getFireblocks();

  const res = await fireblocks.vaults.getPagedVaultAccounts({ limit: 50 });
  console.log(JSON.stringify(res.data, null, 2));
}

main().catch((e: any) => {
  console.error("Error:", e?.response?.data ?? e);
  process.exit(1);
});
