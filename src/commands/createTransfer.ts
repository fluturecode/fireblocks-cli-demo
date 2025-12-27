import { getFireblocks } from "../lib/fireblocks";
import { parseArgs, usage } from "../lib/cli";
import { printJson } from "../lib/output";

type Inputs = {
  fromVaultId: string;
  toVaultId: string;
  assetId: string;
  amount: string;
  raw: boolean;
};

function parseInputs(): Inputs {
  const { raw, positional } = parseArgs();
  const [fromVaultId, toVaultId, assetId, amount] = positional;

  if (!fromVaultId || !toVaultId || !assetId || !amount) {
    usage(
      [
        "Usage:",
        "  pnpm run tx:create -- <fromVaultId> <toVaultId> <assetId> <amount> [--raw]",
        "",
        "Examples:",
        "  pnpm run tx:create -- 4 0 SOL 0.01",
        "  pnpm run tx:create -- 4 0 ETH 0.0001",
        "  pnpm run tx:create -- 4 0 MATIC_POLYGON 0.1",
      ].join("\n")
    );
  }

  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) {
    usage("Amount must be a positive number.");
  }

  return { fromVaultId, toVaultId, assetId, amount, raw };
}

async function main() {
  const fireblocks = getFireblocks();
  const { fromVaultId, toVaultId, assetId, amount, raw } = parseInputs();

  const res = await fireblocks.transactions.createTransaction({
    transactionRequest: {
      assetId,
      amount, // string on purpose
      operation: "TRANSFER",
      source: {
        type: "VAULT_ACCOUNT",
        id: fromVaultId,
      },
      destination: {
        type: "VAULT_ACCOUNT",
        id: toVaultId,
      },
    },
  });

  printJson(res.data);
}

main().catch((e: any) => {
  console.error("Error:", e?.response?.data ?? e);
  process.exit(1);
});