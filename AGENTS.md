# AGENTS.md

Guidance for AI agents and contributors working in this repository.

## Project

`@canonical/yui` — a Canonical-maintained security fork of the archived YUI 3
library. Scope is **security support** for downstream consumers (e.g. Launchpad),
not new features or general bug fixes.

## Current state

- Forked from upstream `yui/yui3` (archived Aug 2014).
- Package renamed to `@canonical/yui`; default branch `main`.
- Source lives in `src/`; built artifacts are committed in `build/` and must stay
  in sync with their `src/` counterparts. The legacy grunt/yogi/bower toolchain is
  retired; `build/` is hand-synced (no build step on install). See `BUILD.md`.
- Target runtime: Node 26 LTS (engines `node >=20`). License: `BSD-3-Clause`.
- CI runs on GitHub Actions (`.github/workflows/ci.yml`) across Node 20/26.
- Active modernization: replacing the deprecated `request` dependency and migrating
  tests to Vitest/Playwright.

## Tests

Two layers, both run in CI:

- New tests (`tests/`): Vitest (`tests/node`) + Playwright (`tests/browser`,
  `tests/legacy`). This is where new/changed coverage goes.
- Legacy upstream suite (`src/<mod>/tests/**`): the original YUITest harnesses.

### Legacy suite is FROZEN — do not modify

The `src/**/tests/**` harnesses are preserved upstream reference and must stay
**unchanged**. Do not edit, port, reformat, or delete them. They run unmodified
via `tests/legacy` (Playwright loads each `.html` through `build/yui` and reads
the test-console verdict). A curated, fast subset is enforced in CI; extend it by
adding a path to `HARNESSES`, never by touching the harness. If a security fix
requires new coverage, add it under `tests/` — leave the originals alone.

## Commit message standard

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>
```

- Types: `feat`, `fix`, `chore`, `docs`, `test`, `build`, `ci`, `refactor`, `perf`.
- Keep descriptions imperative and concise. Reference security advisories where relevant.
- Do not reference internal phases/plans in commit messages.
