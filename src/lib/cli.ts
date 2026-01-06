export type ParsedArgs = {
  raw: boolean;
  positional: string[];
  flags: Record<string, string | boolean>;
};

export function parseArgs(argv = process.argv.slice(2)): ParsedArgs {
  const args = argv.filter((a) => a !== "--");

  const flags: Record<string, string | boolean> = {};
  const positional: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const a = args[i];

    if (!a.startsWith("--")) {
      positional.push(a);
      continue;
    }

    if (a === "--raw") {
      flags.raw = true;
      continue;
    }

    const key = a.slice(2);
    const next = args[i + 1];

    if (!next || next.startsWith("--")) {
      flags[key] = true;
      continue;
    }

    flags[key] = next;
    i++;
  }

  const raw = flags.raw === true;
  return { raw, positional, flags };
}

export function usage(message: string): never {
  throw new Error(message);
}
