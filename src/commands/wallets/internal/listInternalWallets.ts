import { getFireblocks } from "../lib/fireblocks";
import { parseArgs, usage } from "../lib/cli";
import { printJson } from "../lib/output";

type Inputs = {
  assetId?: string;
  limit?: number;
  raw: boolean;
};

function parseInputs(): Inputs {
  const { raw, positional } = parseArgs();
  const args = [...positional];

  let assetId: string | undefined;
  let limit: number | undefined;

  const assetIdx = args.indexOf("--asset");
  if (assetIdx !== -1) {
    assetId = args[assetIdx + 1];
    args.splice(assetIdx, 2);
    if (!assetId) usage("Missing value for --asset");
  }

  const limitIdx = args.indexOf("--limit");
  if (limitIdx !== -1) {
    const n = Number(args[limitIdx + 1]);
    args.splice(limitIdx, 2);
    if (!Number.isFinite(n) || n <= 0) usage("Invalid --limit (example: --limit 25)");
    limit = n;
  }

  if (args.length) {
    usage(
      [
        "Usage:",
        "  pnpm run wallets:internal:list -- [--asset <ASSET>] [--limit <N>] [--raw]",
        "",
        "Examples:",
        "  pnpm run wallets:internal:list --",
        "  pnpm run wallets:internal:list -- --asset ETH",
        "  pnpm run wallets:internal:list -- --asset SOL --limit 10",
      ].join("\n")
    );
  }

  return { assetId, limit, raw };
}

function summarize(w: any) {
  return {
    id: w.id,
    name: w.name,
    address: w.address,
    tag: w.tag,
    assetId: w.assetId,
  };
}

async function main() {
  const fireblocks = getFireblocks();
  const { assetId, limit, raw } = parseInputs();

  const res = await fireblocks.internalWallets.getInternalWallets();

  const wallets = (res.data as any)?.internalWallets ?? (res.data as any) ?? [];

  const filtered = assetId ? wallets.filter((w: any) => w.assetId === assetId) : wallets;
  const sliced = typeof limit === "number" ? filtered.slice(0, limit) : filtered;

  if (raw) {
    printJson(res.data);
    return;
  }

  printJson({
    count: sliced.length,
    filters: { ...(assetId ? { assetId } : {}), ...(limit ? { limit } : {}) },
    internalWallets: sliced.map(summarize),
  });
}

main().catch((e: any) => {
  console.error("Error:", e?.response?.data ?? e);
  process.exit(1);
});