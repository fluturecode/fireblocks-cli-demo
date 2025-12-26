# GitHub Copilot / AI Agent Instructions for fireblocks-ts

This file gives concise, actionable guidance for AI coding agents working on this repository.

## Quick facts 🔎
- Language: TypeScript (TSX suggested by previous commands).
- Package manager: pnpm (see `packageManager` in `package.json`).
- Current repo is minimal: only `package.json` exists at the moment.

## Goals for AI changes ✅
- Keep changes minimal and obvious. This repo appears to be a tiny starter or scaffold — prefer small, well-documented commits.
- Add missing project setup (e.g., `src/`, `tsconfig.json`, simple `scripts`), but only when the requested task requires those files.

## Developer workflows & commands ⚙️
- Use `pnpm` for installs and scripts. Example: `pnpm install`, `pnpm run test`.
- Some developers may use `tsx` for running TypeScript scripts directly (e.g., `pnpm exec -- tsx src/hello.ts`). If adding runnable scripts, ensure `tsx` is added to `devDependencies` or reference via `pnpm exec`.

## Project-specific conventions and patterns 📌
- No opinionated structure is present yet. If you introduce conventions, document them in `README.md` and keep them small and consistent.
- When adding TypeScript, include `tsconfig.json` and add a basic `src/` layout.

## Files to reference when making changes 🗂️
- `package.json` — declares package manager and scripts.
- `README.md` — create or update to document high-level purpose and commands if you add structure.

## Examples of helpful changes the repo expects 💡
- Add a simple `src/hello.ts` and a script `start` to run it with `pnpm exec -- tsx src/hello.ts`.
- Add `test` script replaced with a real test command only if tests are added (e.g., `pnpm run test` using vitest/jest).

## Safety and style guidelines ✍️
- Avoid adding heavy scaffolding without explicit user request (e.g., full framework generators).
- Keep commits atomic and include short, descriptive commit messages.
- Add tests and basic CI only when implementing or changing behavior that needs verification.

---

If you'd like, I can:
1) Create a minimal `src/hello.ts` and add `tsx` to `devDependencies` plus a `start` script, or
2) Create a small `README.md` and `tsconfig.json` scaffolding and update `package.json` scripts.

Tell me which option you prefer or provide additional requirements and I'll iterate on the instructions file and/or implement the changes.