import { getFireblocks } from "@/lib/fireblocks";
import { parseArgs, usage } from "@/lib/cli";
import { printJson } from "@/lib/output";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseInputs() {
  const { raw, positional } = parseArgs();

  let intervalSec = 3;
  let timeoutSec = 180;
  const rest: string[] = [];

  // Single-pass parse: supports flags anywhere
  for (let i = 0; i < positional.length; i++) {
    const a = positional[i];

    if (a === "--interval") {
      const v = positional[i + 1];
      i++;
      intervalSec = Number(v);
      if (!Number.isFinite(intervalSec) || intervalSec <= 0) {
        usage("Invalid --interval. Example: --interval 3");
      }
      continue;
    }

    if (a === "--timeout") {
      const v = positional[i + 1];
      i++;
      timeoutSec = Number(v);
      if (!Number.isFinite(timeoutSec) || timeoutSec <= 0) {
        usage("Invalid --timeout. Example: --timeout 180");
      }
      continue;
    }

    rest.push(a);
  }

  const [txId] = rest;

  if (!txId) {
    usage(
      [
        "Usage:",
        "  pnpm run tx:poll -- <txId> [--interval <sec>] [--timeout <sec>] [--raw]",
        "",
        "Example:",
        "  pnpm run tx:poll -- 75852f0e-2708-4d48-b04a-e4eddaec6d26 --interval 3 --timeout 180",
      ].join("\n")
    );
  }

  return { txId, intervalSec, timeoutSec, raw };
}

async function main() {
  const fireblocks = getFireblocks();
  const { txId, intervalSec, timeoutSec, raw } = parseInputs();

  const start = Date.now();
  const deadline = start + timeoutSec * 1000;

  while (true) {
    const res = await fireblocks.transactions.getTransaction({ txId });
    const tx = res.data as any;

    const status = tx?.status ?? "UNKNOWN";
    const subStatus = tx?.subStatus ?? "";

    console.log(`${new Date().toISOString()}  ${txId}  ${status}${subStatus ? ` (${subStatus})` : ""}`);

    const done = ["COMPLETED", "FAILED", "CANCELLED", "REJECTED", "BLOCKED"].includes(status);
    if (done) {
      console.log("\nFinal transaction:");
      printJson(raw ? tx : tx);
      return;
    }

    if (Date.now() > deadline) {
      console.log("\nTimed out waiting for terminal status. Latest transaction:");
      printJson(raw ? tx : tx);
      process.exit(2);
    }

    await sleep(intervalSec * 1000);
  }
}

main().catch((e: any) => {
  console.error("Error:", e?.response?.data ?? e);
  process.exit(1);
});