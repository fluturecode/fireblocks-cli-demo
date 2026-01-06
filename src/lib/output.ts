export function truncateString(value: unknown, max = 160) {
  if (typeof value !== "string") return value;
  if (value.length <= max) return value;
  return `${value.slice(0, max)}… (${value.length} chars)`;
}

export function deepTruncate(value: any, maxStringLen = 160): any {
  if (Array.isArray(value)) return value.map((v) => deepTruncate(v, maxStringLen));
  if (value && typeof value === "object") {
    const out: any = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = deepTruncate(v, maxStringLen);
    }
    return out;
  }
  return truncateString(value, maxStringLen);
}

export function printJson(
  data: unknown,
  opts?: { truncate?: boolean; maxStringLen?: number }
) {
  const truncate = opts?.truncate ?? false;
  const maxStringLen = opts?.maxStringLen ?? 160;
  const out = truncate ? deepTruncate(data, maxStringLen) : data;
  console.log(JSON.stringify(out, null, 2));
} 