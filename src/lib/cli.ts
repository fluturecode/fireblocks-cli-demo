export type ParsedArgs = {
  raw: boolean;
  positional: string[];
};

export function parseArgs(argv = process.argv.slice(2)): ParsedArgs {
  const filtered = argv.filter((a) => a !== "--");
  const raw = filtered.includes("--raw");
  const positional = filtered.filter((a) => a !== "--raw");
  return { raw, positional };
}

export function usage(message: string): never {
  throw new Error(message);
}