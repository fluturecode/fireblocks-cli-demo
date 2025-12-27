import { getFireblocks } from "../lib/fireblocks";

type Args = {
  limit: number;
  status?: string;
  raw: boolean;
};

function parseArgs(argv: string[]): Args {
  const tokens = argv.slice(2).filter((a) => a !== "--");
  const raw = tokens.includes("--raw");
  const cleaned = tokens.filter((t) => t !== "--raw");

  const [limitRaw, status] = cleaned;
  const limit = limitRaw ? Number(limitRaw) : 25;

  if (!Number.isFinite(limit) || limit <= 0) {
    throw new Error(
      [
        "Usage:",
        "  pnpm run tx:list -- [limit] [status] [--raw]",
        "",
        "Examples:",
        "  pnpm run tx:list",
        "  pnpm run tx:list -- 10",
        "  pnpm run tx:list -- 25 COMPLETED",
        "  pnpm run tx:list -- 25 COMPLETED --raw",
      ].join("\n")
    );
  }

  return { limit, status, raw };
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

  if (Array.isArray(out.signedMessages)) {
    out.signedMessages = out.signedMessages.map((m: any) => ({
      ...m,
      content: truncateHex(m?.content),
    }));
  }

  return out;
}

function compactPayload(payload: any): any {
  if (Array.isArray(payload)) return payload.map(compactTx);

  if (payload && typeof payload === "object") {
    if (Array.isArray(payload.transactions)) {
      return { ...payload, transactions: payload.transactions.map(compactTx) };
    }
    if (Array.isArray(payload.data)) {
      return { ...payload, data: payload.data.map(compactTx) };
    }
    return compactTx(payload);
  }

  return payload;
}

async function main() {
  const fireblocks = getFireblocks();
  const { limit, status, raw } = parseArgs(process.argv);

  const res = await (fireblocks as any).transactions.getTransactions({
    limit,
    ...(status ? { status } : {}),
  });

  const data = unwrap(res);

  console.log(JSON.stringify(raw ? data : compactPayload(data), null, 2));
}

main().catch((e: any) => {
  console.error("Error:", e?.response?.data ?? e);
  process.exit(1);
});