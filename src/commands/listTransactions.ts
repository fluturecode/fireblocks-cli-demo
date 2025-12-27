import { getFireblocks } from "../lib/fireblocks";

type TxListArgs = {
  limit: number;
  status?: string;
};

function parseArgs(argv: string[]): TxListArgs {
  const args = argv.slice(2).filter((a) => a !== "--");
  const [limitRaw, status] = args;

  const limit = limitRaw ? Number(limitRaw) : 25;
  if (Number.isNaN(limit) || limit <= 0) {
    throw new Error(
      [
        "Usage:",
        "  pnpm run tx:list -- [limit] [status]",
        "",
        "Examples:",
        "  pnpm run tx:list",
        "  pnpm run tx:list -- 10",
        "  pnpm run tx:list -- 10 COMPLETED",
      ].join("\n")
    );
  }

  return { limit, status };
}

async function main() {
  const fireblocks = getFireblocks();
  const { limit, status } = parseArgs(process.argv);

  // Fireblocks SDK v13: transactions live under fireblocks.transactions
  // Method naming can vary slightly by SDK generation; this is the common shape.
  const res = await fireblocks.transactions.getTransactions({
    limit,
    status: status as any, // keep demo flexible
  } as any);

  console.log(JSON.stringify(res.data, null, 2));
}

main().catch((e: any) => {
  console.error("Error:", e?.response?.data ?? e);
  process.exit(1);
});