/**
 * generateJwt.ts
 *
 * Helper script for generating Fireblocks JWTs for Postman testing.
 *
 * This script is NOT required when using the Fireblocks SDK.
 * It exists only to help understand and test the raw REST API.
 */
import 'dotenv/config';
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const apiKey = process.env.FIREBLOCKS_API_KEY!;
const privateKeyPath = process.env.FIREBLOCKS_SECRET_PATH!;

if (!apiKey) {
  throw new Error("Missing FIREBLOCKS_API_KEY in .env");
}

if (!privateKeyPath) {
  throw new Error("Missing FIREBLOCKS_SECRET_PATH in .env");
}

const resolvedKeyPath = path.resolve(privateKeyPath);

if (!fs.existsSync(resolvedKeyPath)) {
  throw new Error(`Private key not found at path: ${resolvedKeyPath}`);
}

const privateKey = fs.readFileSync(resolvedKeyPath, "utf8");

const now = Math.floor(Date.now() / 1000);

const payload = {
// List ETH deposit addresses
// "/v1/vault/accounts/0/ETH/addresses_paginated"
// Create deposit address
// "/v1/vault/accounts/0/ETH/addresses"
  uri: "/v1/vault/accounts",
  sub: apiKey,
  nonce: crypto.randomUUID(),
  iat: now,
  exp: now + 55,
};

const token = jwt.sign(payload, privateKey, {
  algorithm: "RS256",
  header: {
    typ: "JWT",
    alg: "RS256",
    kid: apiKey,
  },
});

console.log("\n🔥 Fireblocks JWT (valid ~60s):\n");
console.log(token);
console.log("\n👉 Paste this into Postman as:");
console.log("Authorization: Bearer <TOKEN>\n");
