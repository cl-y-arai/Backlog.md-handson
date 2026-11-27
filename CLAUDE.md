# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Read first

[MANIFESTO.md](MANIFESTO.md) is the project's constitution (who Backlog.md serves, source of truth, surface
hierarchy, design principles, boundaries). Read it before making product or architecture decisions. If a request
conflicts with it, surface the conflict instead of proceeding, and never edit the manifesto as a side effect.

## Commands

Runtime: Bun 1.4.4 (and Node 26.12.1+ for some build tooling). Everything runs through Bun.

| Command | Purpose |
| --- | --- |
| `bun install` | Install dependencies |
| `bun run check:types` | Type-check (`bun --check`; note `bun check` is the Biome script, not types) |
| `bun run check` | Biome format + lint + import checks, no writes |
| `bun run format` / `bun run lint` | Biome with `--write` |
| `bun run test` | Full test suite (`bun test --timeout=10000`) |
| `bun test --timeout=10000 src/test/<file>.test.ts` | Single test file (add `-t "<name>"` for a single test) |
| `bun run build` | Standalone executable at `dist/backlog` (`BACKLOG_BUILD_OUTDIR` emits a JS bundle instead) |
| `bun run cli <args>` | Run the CLI from source, e.g. `bun run cli task list --plain` |
| `bun run mcp` | Start the MCP server from source |

Types, Biome, and tests are separate checks; `bun run check` runs neither types nor tests.

Biome style: tabs, double quotes. The Husky pre-commit hook runs lint-staged (`biome check --write`) and may rewrite
staged files — review the staged diff after committing.

### Test infrastructure

- `bunfig.toml` preloads `src/test/test-preload.ts` (sets a fixed Git identity and, unless
  `BACKLOG_TEST_SKIP_DOM_PRELOAD` is set, a jsdom/react-dom environment) and runs with `smol = true`.
- CI uses `scripts/run-ci-tests.ts`: non-DOM tests run with `--parallel`, while any test file referencing `jsdom` runs
  in a separate single-process pass (parallel workers crash on Linux with the DOM preload, see BACK-585). Preserve
  this split when changing test execution. `--profile=platform` runs only the platform-contract subset.
- Tests use isolated temp directories with cleanup, never the repository's live `backlog/` folder. Don't weaken
  assertions, raise timeouts, or add retries to get a pass.

## Architecture

Backlog.md is a Markdown-native task manager shipped as one `backlog` binary (npm launcher `scripts/cli.cjs` picks a
platform-specific package). The binary offers four surfaces — CLI, terminal UI, local web UI, and an optional MCP
server — that all read and write the same Markdown files through one shared core. The CLI and shared product model
define canonical behavior; TUI and web share its semantics; MCP is an adapter and no feature may exist only there.

- **`src/cli.ts`** — Commander entry point for every command (large file). Thin command handlers call into `Core`.
  Extra command modules live in `src/commands/`.
- **`src/core/backlog.ts` (`Core`)** — the domain API every surface uses: task/draft/doc/decision/milestone CRUD,
  status moves, archiving, ID allocation, auto-commit. Also defines `RecordRefusedError` subclasses that surfaces
  map to user-facing errors.
- **`src/core/content-store.ts`** — in-memory snapshot of tasks/docs/decisions kept fresh by `fs.watch`; long-running
  processes (web server, search, TUI) subscribe to it so edits from other processes/editors appear live.
- **`src/core/task-loader.ts` + `cross-branch-tasks.ts`** — read task state from other local/remote Git branches
  (within `activeBranchDays`) and pick each task's most-progressed copy. Skipped when `checkActiveBranches` is off
  or there is no Git.
- **`src/core/task-identity-index.ts`** — resolves task IDs (prefixes, zero padding, archived/completed folders).
- **`src/file-system/operations.ts`** — file storage under `backlog/` with `proper-lockfile` locks for creation and
  record mutations. **`src/git/operations.ts`** — shells out to native Git.
- **`src/markdown/`** — frontmatter parsing/serialization (`gray-matter`, patched in `patches/`) and structured
  sections (acceptance criteria, plan, notes, final summary, decision sections) stored as marked regions in the body.
- **`src/ui/`** — blessed-based TUI (board, task viewer, unified view).
- **`src/server/index.ts`** — Bun HTTP + WebSocket server for the browser UI; imports `src/web/index.html` directly
  (Bun HTML bundling, Tailwind via `bun-plugin-tailwind`). **`src/web/`** — React app.
- **`src/mcp/`** — MCP server (`server.ts`), tools grouped by domain in `tools/`, plus resources and validation.
- **`src/guidelines/`** — agent instructions shipped inside the binary: `cli-instructions/` back
  `backlog instructions <topic>`, `mcp/` back MCP workflow resources. Users of the binary can't see this source tree,
  so conventions external agents need must be documented there or in CLI help.
- **`src/formatters/`** — `--plain` and JSON output formats.

[groma/](groma/) holds a C4-style architecture map (systems → containers → components with code links). It is
Groma-owned; don't edit it by hand.

Public contracts are the documented CLI behavior, MCP tools/schemas, config, help text, and shipped instructions.
Internal TypeScript exports are not public and don't need compatibility shims.

## Backlog workflow for this repo

This repo manages its own work with Backlog.md (`backlog/` folder; task IDs like `BACK-123`).

- Never edit files under `backlog/` directly; use the CLI (`backlog …` or `bun run cli …`) so metadata, IDs, and
  history stay consistent. Let the CLI allocate task IDs.
- Read the shipped guides before lifecycle actions: `backlog instructions overview`, then `task-creation`,
  `task-execution`, or `task-finalization` as relevant. Use `backlog <command> --help` for unfamiliar commands.
- Every PR needs an associated Backlog task. Branch as `tasks/back-123-short-name`; commit subject and PR title are
  `BACK-123 - <exact task title>`. Keep PR descriptions brief (non-obvious reasons/tradeoffs only).
- Don't bump `package.json`'s version manually; releases are cut via GitHub Release and the Release workflow.

## UI copy

Don't add subtitles or helper text under headings, labels, cards, or settings unless requested or needed to prevent
errors. Prefer one self-explanatory label.
