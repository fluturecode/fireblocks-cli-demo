import { getFireblocks } from "../../lib/fireblocks";
import { parseArgs, usage } from "../../lib/cli";
import { deepTruncate, printJson } from "../../lib/output";

type Inputs = {
  vaultId: string;
  assetId: string; // ETH | MATIC_POLYGON (EVM assets)
  contractAddress: string;
  calldata: string; // 0x...
  value: string; // native amount as string, usually "0"
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
    if (!note) usage('Missing value for --note (example: --note "demo contract call")');
  }

  // Usage:
  // pnpm run evm:contractCall -- <vaultId> <assetId> <contractAddress> <calldata> [--value <amount>] [--note "..."] [--raw]
  // value is optional, default 0
  let value = "0";
  const valueIdx = args.indexOf("--value");
  if (valueIdx !== -1) {
    value = args[valueIdx + 1];
    args.splice(valueIdx, 2);
    if (!value) usage('Missing value for --value (example: --value 0)');
  }

  const [vaultId, assetId, contractAddress, calldata] = args;

  if (!vaultId || !assetId || !contractAddress || !calldata) {
    usage(
      [
        "Usage:",
        "  pnpm run evm:contractCall -- <vaultId> <assetId> <contractAddress> <calldata> [--value <amount>] [--note \"...\"] [--raw]",
        "",
        "Examples:",
        "  pnpm run evm:contractCall -- 0 ETH 0xYourContract 0xabcdef... --note \"eth contract call\"",
        "  pnpm run evm:contractCall -- 0 MATIC_POLYGON 0xYourContract 0xabcdef... --note \"polygon contract call\"",
        "",
        "Notes:",
        "  - calldata must start with 0x",
        "  - This is EVM-only (ETH + Polygon are great demo assets).",
      ].join("\n")
    );
  }

  if (!/^0x[0-9a-fA-F]*$/.test(calldata)) usage("calldata must be hex starting with 0x");
  if (!/^0x[0-9a-fA-F]{40}$/.test(contractAddress)) usage("contractAddress must be a 0x + 40-hex EVM address");

  // keep value as a string
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) usage("--value must be a number >= 0 (example: --value 0)");

  return { vaultId, assetId, contractAddress, calldata, value, note, raw };
}

async function main() {
  const fireblocks = getFireblocks();
  const { vaultId, assetId, contractAddress, calldata, value, note, raw } = parseInputs();

  // Fireblocks models contract calls as a transaction with operation "CONTRACT_CALL"
  // and puts the calldata in extraParameters.contractCallData.
  const res = await fireblocks.transactions.createTransaction({
    transactionRequest: {
      operation: "CONTRACT_CALL",
      assetId,
      amount: value, // native value sent with the call; usually "0"
      source: { type: "VAULT_ACCOUNT", id: vaultId },

      // Send to a one-time address (the contract)
      destination: {
        type: "ONE_TIME_ADDRESS",
        oneTimeAddress: { address: contractAddress },
      },

      extraParameters: {
        contractCallData: calldata,
      },

      ...(note ? { note } : {}),
    },
  });

  const data = res.data;
  printJson(raw ? data : deepTruncate(data, 160));
}

main().catch((e: any) => {
  console.error("Error:", e?.response?.data ?? e);
  process.exit(1);
});