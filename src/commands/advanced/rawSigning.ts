import { getFireblocks } from "../../lib/fireblocks";
import { parseArgs, usage } from "../../lib/cli";
import { deepTruncate, printJson } from "../../lib/output";

type Inputs = {
  raw: boolean;
  vaultId: string;
  assetId: string;
  payloadHex: string; // 0x...
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
    if (!note) usage('Missing value for --note (example: --note "raw sign demo")');
  }

  const [vaultId, assetId, payloadHex] = args;

  if (!vaultId || !assetId || !payloadHex) {
    usage(
      [
        "Usage:",
        "  pnpm run raw:sign -- <vaultId> <assetId> <payloadHex> [--note \"...\"] [--raw]",
        "",
        "Example:",
        "  pnpm run raw:sign -- 0 ETH 0xdeadbeef --note \"raw sign demo\"",
        "",
        "Notes:",
        "  - payloadHex must start with 0x",
        "  - RAW signing is an advanced feature; availability varies by workspace.",
      ].join("\n")
    );
  }

  if (!/^0x[0-9a-fA-F]*$/.test(payloadHex)) usage("payloadHex must be hex starting with 0x");

  return { raw, vaultId, assetId, payloadHex, note };
}

async function main() {
  const fireblocks = getFireblocks();
  const { raw, vaultId, assetId, payloadHex, note } = parseInputs();

  const fbAny = fireblocks as any;

  // Method names vary; we try common patterns.
  const candidate =
    fbAny.rawSigning?.sign ||
    fbAny.rawSigning?.signMessage ||
    fbAny.signing?.signRaw ||
    fbAny.signing?.rawSign;

  if (typeof candidate !== "function") {
    usage(
      [
        "RAW signing is not available via this SDK client in your environment.",
        "",
        "What to do:",
        "  1) Confirm RAW signing feature is enabled for this workspace in Console.",
        "  2) Search your SDK install for 'rawSigning' or 'signRaw' to find the exact method:",
        "     grep -R \"rawSigning\\|signRaw\" -n node_modules/.pnpm/@fireblocks+ts-sdk@*/node_modules/@fireblocks/ts-sdk/dist | head",
        "  3) Once you find the right method signature, we’ll wire it here.",
      ].join("\n")
    );
  }

  const res = await candidate.call(fbAny, {
    vaultId,
    assetId,
    payloadHex,
    ...(note ? { note } : {}),
  });

  const data = res?.data ?? res;
  printJson(raw ? data : deepTruncate(data, 160));
}

main().catch((e: any) => {
  console.error("Error:", e?.response?.data ?? e);
  process.exit(1);
});