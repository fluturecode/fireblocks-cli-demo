import { getFireblocks } from "@/lib/fireblocks";
import { parseArgs, usage } from "@/lib/cli";
import { deepTruncate, printJson } from "@/lib/output";

type Inputs = {
  raw: boolean;
  fromVaultId: string;
  toVaultId: string;
  assetId: string; // demo: SOL / ETH / MATIC_POLYGON
  amount: string;
  note?: string;
};

function parseInputs(): Inputs {
  const { raw, positional } = parseArgs();
  const args = [...positional];

  let note: string | undefined;
  const noteIdx = args.indexOf("--note");
  if (noteIdx !== -1) {
    note = args[noteIdx + 1];
    args.splice(noteIdx, 2);
    if (!note) usage('Missing value for --note (example: --note "demo transfer assist")');
  }

  const [fromVaultId, toVaultId, assetId, amount] = args;

  if (!fromVaultId || !toVaultId || !assetId || !amount) {
    usage(
      [
        "Usage:",
        "  pnpm run assist:transfer -- <fromVaultId> <toVaultId> <assetId> <amount> [--note \"...\"] [--raw]",
        "",
        "Examples:",
        "  pnpm run assist:transfer -- 4 0 SOL 0.01 --note \"assist sol\"",
        "  pnpm run assist:transfer -- 4 0 ETH 0.0001 --note \"assist eth\"",
        "  pnpm run assist:transfer -- 4 0 MATIC_POLYGON 0.1 --note \"assist polygon\"",
      ].join("\n")
    );
  }

  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) usage("Amount must be a positive number.");

  return { raw, fromVaultId, toVaultId, assetId, amount, note };
}

async function main() {
  const fireblocks = getFireblocks();
  const { raw, fromVaultId, toVaultId, assetId, amount, note } = parseInputs();

  // Transfer Assist APIs can vary by workspace / SDK surface.
  // We’ll attempt to call it if available, otherwise guide the user.
  const fbAny = fireblocks as any;

  const candidate =
    fbAny.transferAssist?.createTransferAssistTransaction ||
    fbAny.transferAssist?.createTransfer ||
    fbAny.transferAssists?.createTransfer ||
    fbAny.assistedTransfers?.createTransfer;

  if (typeof candidate !== "function") {
    usage(
      [
        "Transfer Assist is not available via this SDK client in your environment.",
        "",
        "What to do:",
        "  1) Confirm Transfer Assist is enabled for the workspace in Console.",
        "  2) Check the ts-sdk surface for your version (search for 'transferAssist' in node_modules).",
        "  3) If enabled, we can wire this command to the exact method name your SDK exposes.",
        "",
        "In the meantime, use tx:create for a standard transfer:",
        "  pnpm run tx:create -- <fromVaultId> <toVaultId> <assetId> <amount> --note \"...\"",
      ].join("\n")
    );
  }

  const res = await candidate.call(fbAny, {
    fromVaultId,
    toVaultId,
    assetId,
    amount,
    ...(note ? { note } : {}),
  });

  const data = res?.data ?? res;
  printJson(raw ? data : deepTruncate(data, 160));
}

main().catch((e: any) => {
  console.error("Error:", e?.response?.data ?? e);
  process.exit(1);
});