import { getFireblocks } from "../lib/fireblocks";
import { parseArgs, usage } from "../lib/cli";
import { printJson } from "../lib/output";

async function main() {
  const fireblocks = getFireblocks();
  const { positional } = parseArgs();

  const [name] = positional;

  if (!name) {
    usage(
      [
        "Usage:",
        '  pnpm run create:vault -- "<vault name>"',
        "",
        "Examples:",
        '  pnpm run create:vault -- "Demo Vault"',
        '  pnpm run create:vault -- "SOL Demo Vault"',
      ].join("\n")
    );
  }

  const res = await fireblocks.vaults.createVaultAccount({
   createVaultAccountRequest: { name },
  });

  printJson(res.data);
}

main().catch((e: any) => {
  console.error("Error:", e?.response?.data ?? e);
  process.exit(1);
});