# Fireblocks TypeScript Demo (SDK + REST)

A clean, opinionated **TypeScript demo project** for interacting with the **Fireblocks platform**
using the official **Fireblocks TypeScript SDK**.

This repository is designed as a **practical starting point** for developers new to Fireblocks,
with a structure that mirrors real workflows in the Fireblocks Console.

All core functionality is **SDK-first**.  
Optional **raw REST + JWT tooling** is included only to explain authentication mechanics and
support learning or debugging with tools like Postman.

---

## Key Concepts

- **SDK-first**  
  Uses `@fireblocks/ts-sdk` for all standard operations. No manual JWT handling required.

- **Console-aligned**  
  Commands map directly to Fireblocks Console concepts:
  vaults, wallets, deposit addresses, and transactions.

- **REST explained, not required**  
  Raw REST examples exist only to demonstrate how Fireblocks authentication works under the hood.

- **Beginner-friendly, production-aware**  
  Minimal abstractions, clear CLI commands, and strong typing throughout.

---

## SDK vs REST

Fireblocks exposes a single REST API, but SDKs simplify and secure access.

This project uses the **TypeScript SDK** for all normal usage.  
Raw REST access is included **only for educational purposes**.

> **Building an app? Use the SDK.**  
> **Learning how Fireblocks works? Explore the REST examples.**

---

## Quick Start

### 1. Prerequisites

- Node.js 18+
- pnpm
- Fireblocks workspace
- Fireblocks API key + private key (PEM)

---

### 2. Install Dependencies

```bash
pnpm install
```

---

### 3. Environment Setup

Create a `.env` file in the project root:

```env
FIREBLOCKS_API_KEY=<YOUR_API_KEY>
FIREBLOCKS_SECRET_PATH=./secrets/fireblocks_secret.key

# Sandbox (recommended)
# FIREBLOCKS_BASE_PATH=https://sandbox-api.fireblocks.io

# Production
FIREBLOCKS_BASE_PATH=https://api.fireblocks.io
```

⚠️ **Never commit `.env` or private keys**

---

### 4. Verify Connection

```bash
pnpm run vault:list
```

You should see a paginated list of vault accounts.

---

## Project Structure

```text
src/
├─ lib/
│  ├─ fireblocks.ts        # Fireblocks client bootstrap
│  ├─ cli.ts               # CLI arg parsing
│  └─ output.ts            # JSON formatting + truncation
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
│
└─ tools/
   └─ generateJwt.ts       # REST / Postman helper only
```

---

## Common Commands

### Vaults

```bash
pnpm run vault:list
pnpm run vault:create -- "My New Vault"
```

---

### Deposit Addresses

```bash
pnpm run deposit:list -- <vaultId> SOL
pnpm run deposit:create -- <vaultId> SOL
```

> Note: Some assets (ETH, MATIC) may require address creation via the Console UI first.

---

### Internal Wallets

```bash
pnpm run wallets:internal:list
pnpm run wallets:internal:get -- <walletId>
```

---

### External Wallets

```bash
pnpm run wallets:external:list
```

---

### Transactions

Create a transfer (Vault → Vault):

```bash
pnpm run tx:create -- <fromVaultId> <toVaultId> SOL 0.01 --note "demo sol transfer"
```

List transactions:

```bash
pnpm run tx:list
pnpm run tx:list -- --asset SOL --limit 5
pnpm run tx:list -- --asset SOL --limit 5 --raw
```

Get a transaction:

```bash
pnpm run tx:get -- <transactionId>
pnpm run tx:get -- <transactionId> --raw
```

Poll until completion:

```bash
pnpm run tx:poll -- <transactionId> --interval 3 --timeout 180
```

---

## SDK vs REST API

Fireblocks exposes **one REST API**, but provides SDKs for safety and convenience.

### SDK (Recommended)

- Handles JWT signing automatically
- Strong typing
- Retry + error handling
- Much harder to misuse

All main commands in this repo use the **SDK**.

---

### REST (Advanced / Learning)

The `tools/generateJwt.ts` script exists **only** to help with:
- Postman testing
- Understanding JWT signing
- Debugging raw requests

You do **not** need REST JWTs when using the SDK.

---

## Fireblocks REST Authentication (JWT)

When calling REST endpoints directly:

**JWT `uri` must match the request exactly.**

Rules:
- Include `/v1`
- Include query string
- Exclude domain
- No trailing slashes

Example:

Request:
```http
GET /v1/vault/accounts_paged?limit=50
```

JWT payload:
```json
{
  "uri": "/v1/vault/accounts_paged?limit=50",
  "sub": "<API_KEY>",
  "nonce": 123456789,
  "iat": 1700000000,
  "exp": 1700000180
}
```

---

## Asset Coverage

This project intentionally demonstrates differences between:

- **ETH** (EVM, account-based)
- **SOL** (non-EVM, staking, rent)
- **POLYGON (MATIC)** (EVM sidechain)

You will see real behavioral differences across:
- Deposit address creation
- Fees
- Transaction metadata
- Extra parameters

---

## Notes & Best Practices

- Amounts are passed as **strings** to avoid floating-point errors
- CLI flags are consistent across commands
- `--raw` always returns full API payloads
- Output is truncated by default for readability

---

## Next Steps

- Extend transfers to external wallets
- Add ERC-20 contract calls
- Add policy-aware flows
- Build UI on top of these commands

---

## Disclaimer

This repository is for **educational and demo purposes**.
Always follow your organization’s security and operational policies
when interacting with production assets.

---

Happy building 🚀
