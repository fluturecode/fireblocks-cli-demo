import { getFireblocks } from "@/lib/fireblocks";
import { parseArgs, usage } from "@/lib/cli";
import { printJson } from "@/lib/output";

async function main() {
  const fireblocks = getFireblocks();
  const { raw, flags } = parseArgs();

  const limit =
    typeof flags.limit === "string" ? Number(flags.limit) : 50;

  if (!Number.isFinite(limit) || limit <= 0) {
    usage("Invalid --limit. Example: --limit 50");
  }

  const res = await fireblocks.vaults.getPagedVaultAccounts({ limit });

  printJson(res.data);
}

main().catch((e: any) => {
  console.error("Error:", e?.response?.data ?? e);
  process.exit(1);
});