
import { getFireblocks } from "../lib/fireblocks";
import { parseArgs, usage } from "../lib/cli.ts";
import { deepTruncate, printJson } from "../lib/output";

type ParsedFlags = {
  asset?: string;
  limit: number;
  raw: boolean;
};

function parseFlags(): ParsedFlags {
  const { raw, positional } = parseArgs();

  let asset: string | undefined;
  let limit = 10;

  const args = [...positional];

  const takeValue = (flag: string) => {
    const idx = args.indexOf(flag);
    if (idx === -1) return undefined;
    const val = args[idx + 1];
    args.splice(idx, 2);
    return val;
  };

  const assetFlag = takeValue("--asset");
  if (assetFlag) asset = assetFlag;

  const limitFlag = takeValue("--limit");
  if (limitFlag) {
    const n = Number(limitFlag);
    if (!Number.isFinite(n) || n <= 0) usage("Usage: pnpm run tx:list -- [--asset <ASSET>] [--limit <N>] [--raw]");
    limit = Math.floor(n);
  }

  if (!asset && args[0] && !args[0].startsWith("--")) asset = args[0];
  if (args[1] && !args[1].startsWith("--")) {
    const n = Number(args[1]);
    if (Number.isFinite(n) && n > 0) limit = Math.floor(n);
  }

  return { asset, limit, raw };
}

async function main() {
  const fireblocks = getFireblocks();
  const { asset, limit, raw } = parseFlags();

  const res = await fireblocks.transactions.getTransactions({
    limit,
    ...(asset ? { assetId: asset } : {}),
  });

  if (raw) {
    printJson(res.data);
    return;
  }

  const items = (res.data as any[]) ?? [];
  const cleaned = items.map((tx) => ({
    id: tx.id,
    createdAt: tx.createdAt,
    lastUpdated: tx.lastUpdated,
    assetId: tx.assetId,
    operation: tx.operation,
    status: tx.status,
    subStatus: tx.subStatus,
    amount: tx.amount,
    fee: tx.fee ?? tx.networkFee,
    source: tx.source
      ? { id: tx.source.id, type: tx.source.type, name: tx.source.name }
      : undefined,
    destination: tx.destination
      ? { id: tx.destination.id, type: tx.destination.type, name: tx.destination.name }
      : undefined,
    txHash: tx.txHash,
    extraParameters: deepTruncate(tx.extraParameters, 160),
  }));

  printJson({
    count: cleaned.length,
    filters: { ...(asset ? { assetId: asset } : {}), limit },
    transactions: cleaned,
  });
}

main().catch((e: any) => {
  console.error("Error:", e?.response?.data ?? e);
  process.exit(1);
});