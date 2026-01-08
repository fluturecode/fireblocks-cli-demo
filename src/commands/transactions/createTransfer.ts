import { getFireblocks } from "@/lib/fireblocks";
import { parseArgs, usage } from "@/lib/cli";
import { printJson } from "@/lib/output";
import crypto from "node:crypto";

type Inputs = {
  fromVaultId: string;
  toVaultId: string;
  assetId: string;
  amount: string;
  note?: string;
  raw: boolean;
};

function parseInputs(): Inputs {
  const { raw, positional } = parseArgs();

  const args = [...positional];
  let note: string | undefined;

  const noteIdx = args.indexOf("--note");
  if (noteIdx !== -1) {
    note = args[noteIdx + 1];
    args.splice(noteIdx, 2);
    if (!note) usage('Missing value for --note (example: --note "demo transfer")');
  }

  const [fromVaultId, toVaultId, assetId, amount] = args;

  if (!fromVaultId || !toVaultId || !assetId || !amount) {
    usage(
      [
        "Usage:",
        '  pnpm run tx:create -- <fromVaultId> <toVaultId> <assetId> <amount> [--note "..."]',
        "",
        "Examples:",
        '  pnpm run tx:create -- 4 0 SOL 0.01 --note "demo sol transfer"',
        '  pnpm run tx:create -- 4 0 ETH 0.0001 --note "demo eth transfer"',
        '  pnpm run tx:create -- 4 0 MATIC_POLYGON 0.1 --note "demo polygon transfer"',
      ].join("\n")
    );
  }

  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) {
    usage("Amount must be a positive number (example: 0.01).");
  }

  return { fromVaultId, toVaultId, assetId, amount, note, raw };
}

async function main() {
  const fireblocks = getFireblocks();
  const { fromVaultId, toVaultId, assetId, amount, note } = parseInputs();

  const res = await fireblocks.transactions.createTransaction({
    transactionRequest: {
      assetId,
      amount,
      operation: "TRANSFER",
      source: { type: "VAULT_ACCOUNT", id: fromVaultId },
      destination: { type: "VAULT_ACCOUNT", id: toVaultId },
      ...(note ? { note } : {}),
    },
    idempotencyKey: crypto.randomUUID(),
  });

  printJson(res.data);
}

main().catch((e: any) => {
  console.error("Error:", e?.response?.data ?? e);
  process.exit(1);
});