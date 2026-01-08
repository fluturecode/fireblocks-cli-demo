# Fireblocks TypeScript CLI Demo Project

This repository is a **hands-on Fireblocks API + SDK demo project** written in TypeScript.
It is designed to be:

- ✅ Practical and console-driven
- ✅ Aligned with common customer API usage
- ✅ A solid starting point for experimentation and learning
- ✅ Explicit about real-world limitations (workspace & asset constraints)

The project uses the **Fireblocks TypeScript SDK** and exposes common operations via `pnpm` commands.

---

## Prerequisites

- Node.js 18+
- pnpm
- Fireblocks API key + RSA private key
- Access to a Fireblocks workspace (sandbox or prod)

---

## Installation

```bash
pnpm install

---

## Environment Configuration

FIREBLOCKS_API_KEY=<YOUR_API_KEY>
FIREBLOCKS_SECRET_PATH=./secrets/fireblocks_secret.key

# Use sandbox unless you explicitly intend to use prod
# FIREBLOCKS_BASE_PATH=https://sandbox-api.fireblocks.io
FIREBLOCKS_BASE_PATH=https://api.fireblocks.io

⚠️ Never commit your .env file or private key.

---

##Project Structure

src/
├─ lib/
│  ├─ fireblocks.ts        # SDK initialization & validation
│  ├─ cli.ts               # CLI argument parsing
│  └─ output.ts            # JSON formatting & truncation helpers
│
├─ commands/
│  ├─ vaults/
│  │  ├─ listVaults.ts
│  │  ├─ createVault.ts
│  │  ├─ listDepositAddresses.ts
│  │  └─ createDepositAddress.ts
│  │
│  ├─ wallets/
│  │  ├─ internal/
│  │  │  ├─ listInternalWallets.ts
│  │  │  └─ getInternalWallet.ts
│  │  └─ external/
│  │     └─ listExternalWallets.ts
│  │
│  ├─ transactions/
│  │  ├─ createTransfer.ts
│  │  ├─ listTransactions.ts
│  │  ├─ getTransaction.ts
│  │  └─ pollTransaction.ts
│  │
│  └─ advanced/
│     ├─ transferAssist.ts
│     ├─ contractCall.ts
│     └─ rawSigning.ts
