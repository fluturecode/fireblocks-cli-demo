import { getFireblocks } from "@/lib/fireblocks";
import { parseArgs, usage } from "@/lib/cli";
import { printJson } from "@/lib/output";

type Inputs = {
  vaultAccountId: string;
  assetId: string;
  description?: string;
  raw: boolean;
};

function parseInputs(): Inputs {
  const { raw, positional } = parseArgs();

  const args = [...positional];
  let description: string | undefined;

  const descIdx = args.indexOf("--description");
  if (descIdx !== -1) {
    description = args[descIdx + 1];
    args.splice(descIdx, 2);
    if (!description) {
      usage('Missing value for --description (example: --description "Treasury SOL")');
    }
  }

  const [vaultAccountId, assetId] = args;

  if (!vaultAccountId || !assetId) {
    usage(
      [
        "Usage:",
        "  pnpm run deposit:create -- <vaultId> <assetId> [--description \"...\"] [--raw]",
        "",
        "Examples:",
        '  pnpm run deposit:create -- 0 SOL --description "Treasury SOL"',
        '  pnpm run deposit:create -- 0 ETH --description "Treasury ETH"',
        '  pnpm run deposit:create -- 0 MATIC_POLYGON --description "Treasury Polygon"',
      ].join("\n")
    );
  }

  return { vaultAccountId, assetId, description, raw };
}

async function main() {
  const fireblocks = getFireblocks();
  const { vaultAccountId, assetId, description, raw } = parseInputs();

  const res = await fireblocks.vaults.createVaultAccountAssetAddress({
    vaultAccountId,
    assetId,
    ...(description ? { description } : {}),
  });

  printJson(raw ? res.data : res.data);
}

main().catch((e: any) => {
  const apiErr = e?.response?.data;
  const code = apiErr?.code;

  if (code === 1010) {
    // Common in some workspaces/assets: address creation is not permitted via API
    throw new Error(
      [
        "Creating deposit addresses is not supported for this asset in this workspace (code 1010).",
        "Try one of these instead:",
        "  1) List existing addresses: pnpm run deposit:list -- <vaultId> <assetId>",
        "  2) Create the address in Fireblocks Console UI, then re-run: pnpm run deposit:list -- <vaultId> <assetId>",
      ].join("\n")
    );
  }

  console.error("Error:", apiErr ?? e);
  process.exit(1);
});