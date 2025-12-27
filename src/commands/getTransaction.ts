import { getFireblocks } from "../lib/fireblocks";

function parseArgs(argv: string[]) {
  const args = argv.slice(2).filter((a) => a !== "--");
  const [txId] = args;

  if (!txId) {
    throw new Error(
      [
        "Usage:",
        "  pnpm run tx:get -- <transactionId>",
        "",
        "Example:",
        "  pnpm run tx:get -- 12345678-1234-1234-1234-123456789012",
      ].join("\n")
    );
  }

  return { txId };
}

async function main() {
  const fireblocks = getFireblocks();
  const { txId } = parseArgs(process.argv);

  const res = await fireblocks.transactions.getTransaction({ txId } as any);
  console.log(JSON.stringify(res.data, null, 2));
}

main().catch((e: any) => {
  console.error("Error:", e?.response?.data ?? e);
  process.exit(1);
});