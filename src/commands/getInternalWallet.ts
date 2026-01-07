import { getFireblocks } from "../lib/fireblocks";
import { parseArgs, usage } from "../lib/cli";
import { printJson } from "../lib/output";

type Inputs = {
  walletId: string;
  raw: boolean;
};

function parseInputs(): Inputs {
  const { raw, positional } = parseArgs();
  const args = [...positional];

  const [walletId] = args;

  if (!walletId) {
    usage(
      [
        "Usage:",
        "  pnpm run wallets:internal:get -- <walletId> [--raw]",
        "",
        "Examples:",
        "  pnpm run wallets:internal:get -- 13dbfae3-6155-4667-b4a2-f1a537191c7b",
        "  pnpm run wallets:internal:get -- 13dbfae3-6155-4667-b4a2-f1a537191c7b --raw",
        "",
        "Tip: First list internal wallets to get an ID:",
        "  pnpm run wallets:internal:list -- --limit 5",
      ].join("\n")
    );
  }

  return { walletId, raw };
}

function summarize(w: any) {
  return {
    id: w.id,
    name: w.name,
    // some workspaces expose address/tag/assetId depending on wallet type
    address: w.address,
    tag: w.tag,
    assetId: w.assetId,
    customerRefId: w.customerRefId,
  };
}

async function main() {
  const fireblocks = getFireblocks();
  const { walletId, raw } = parseInputs();

  // per your SDK typings: getInternalWallet(walletId, options?)
  const res = await fireblocks.internalWallets.getInternalWallet(walletId);

  if (raw) {
    printJson(res.data);
    return;
  }

  printJson(summarize(res.data));
}

main().catch((e: any) => {
  console.error("Error:", e?.response?.data ?? e);
  process.exit(1);
});