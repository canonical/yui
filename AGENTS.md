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
  in sync with their `src/` counterparts.
- Target runtime: Node 26 LTS (engines `node >=18`).
- Active modernization: replacing the deprecated `request` dependency, migrating
  tests to Vitest/Playwright, and moving CI to GitHub Actions.

## Commit message standard

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>
```

- Types: `feat`, `fix`, `chore`, `docs`, `test`, `build`, `ci`, `refactor`, `perf`.
- Keep descriptions imperative and concise. Reference security advisories where relevant.
- Do not reference internal phases/plans in commit messages.
