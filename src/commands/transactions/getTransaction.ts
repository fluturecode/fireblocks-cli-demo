import { getFireblocks } from "@/lib/fireblocks";

type Args = {
  txId: string;
  raw: boolean;
};

function parseArgs(argv: string[]): Args {
  const tokens = argv.slice(2).filter((a) => a !== "--");
  const raw = tokens.includes("--raw");
  const cleaned = tokens.filter((t) => t !== "--raw");

  const [txId] = cleaned;

  if (!txId) {
    throw new Error(
      [
        "Usage:",
        "  pnpm run tx:get -- <txId> [--raw]",
        "",
        "Examples:",
        "  pnpm run tx:get -- 1947f8ec-87c5-406c-803a-7ca390deb2e5",
        "  pnpm run tx:get -- 1947f8ec-87c5-406c-803a-7ca390deb2e5 --raw",
      ].join("\n")
    );
  }

  return { txId, raw };
}

function unwrap(res: any): any {
  return res?.data ?? res;
}

function truncateHex(value: unknown, keep = 18): unknown {
  if (typeof value !== "string") return value;
  if (!value.startsWith("0x")) return value;

  const minLen = keep * 2 + 2;
  if (value.length <= minLen) return value;

  return `${value.slice(0, keep + 2)}…${value.slice(-keep)} (len=${value.length})`;
}

function compactTx(tx: any): any {
  if (!tx || typeof tx !== "object") return tx;
  const out = { ...tx };

  if (typeof out.contractCallData === "string") {
    out.contractCallData = truncateHex(out.contractCallData);
  }

  if (out.extraParameters && typeof out.extraParameters === "object") {
    const ep = { ...out.extraParameters };
    if (typeof ep.contractCallData === "string") {
      ep.contractCallData = truncateHex(ep.contractCallData);
    }
    out.extraParameters = ep;
  }

  if (Array.isArray(out.signedMessages)) {
    out.signedMessages = out.signedMessages.map((m: any) => ({
      ...m,
      content: truncateHex(m?.content),
    }));
  }

  return out;
}

async function main() {
  const fireblocks = getFireblocks();
  const { txId, raw } = parseArgs(process.argv);

  // SDK v13 style: getTransaction({ txId })
  const res = await (fireblocks as any).transactions.getTransaction({ txId });
  const data = unwrap(res);

  console.log(JSON.stringify(raw ? data : compactTx(data), null, 2));
}

main().catch((e: any) => {
  console.error("Error:", e?.response?.data ?? e);
  process.exit(1);
});