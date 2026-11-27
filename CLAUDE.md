# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Read first

- @AGENTS.md is imported below. It holds the full agent working agreement and wins over this summary if they differ.
- Read [MANIFESTO.md](MANIFESTO.md) before architecture or product decisions. It is the project's constitution
  (humans and agents are both first-class users; Markdown is the source of truth; the CLI is canonical). If a request
  conflicts with it, surface the conflict and ask instead of proceeding. Do not edit it as a side effect.
- [README.md](README.md) describes user-facing behavior; [CLI-INSTRUCTIONS.md](CLI-INSTRUCTIONS.md) and
  `src/guidelines/` hold the shipped agent workflow text.

## Commands

Runtime is Bun (TypeScript, no separate build step for development).

| Command | Purpose |
| --- | --- |
| `bun install` | Install dependencies |
| `bun run cli <args>` | Run the CLI from source (`bun src/cli.ts`) |
| `bun run check:types` | Type-check (`bun --check`) |
| `bun run check` | Biome format + lint + import order, no writes |
| `bun run test` | Full test suite (`bun test --timeout=10000`) |
| `bun test --timeout=10000 src/test/<file>.test.ts` | Run a single test file |
| `bun run build` | Build the CLI binary (`scripts/build.ts`) |

`check`, `check:types`, and `test` are independent; run each one the change affects. Formatting follows
[biome.json](biome.json) (tabs, double quotes). The Husky pre-commit hook runs `lint-staged`, which can rewrite staged
files, so review the staged diff before committing.

CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)) uses [scripts/run-ci-tests.ts](scripts/run-ci-tests.ts), which
separates platform-contract/serial tests and the DOM test pass from the parallel run. Keep that split when changing test
execution.

## Architecture

One shared product model, several surfaces over it:

- **CLI (canonical surface)**: `src/cli.ts` is a single large Commander program that registers almost every command and
  its handlers. A few commands live in `src/commands/` (completion, instructions, mcp, help schema, wizards).
  `addHelpSchema()` in `src/commands/help-schema.ts` appends the structured "Input schema / Output / Examples" section to
  `--help`; external agents rely on this help text, so treat it as a public contract.
- **Core model**: `Core` (`src/core/backlog.ts`) is the entry point every surface uses for semantic operations (create,
  edit, archive, query, search). It delegates to `FileSystem` (`src/file-system/operations.ts`) for reading/writing the
  `backlog/` directory, `GitOperations` (`src/git/operations.ts`) for auto-commit and cross-branch task state, and
  `src/markdown/` for frontmatter parsing and serialization. Task ID allocation goes through the CLI allocator and lock,
  never hand-picked IDs.
- **TUI**: `src/ui/` (neo-neo-bblessed), e.g. `unified-view.ts` for the interactive task list/board.
- **Browser UI**: `src/web/` (React) served by `src/server/index.ts` on 127.0.0.1 via `backlog browser`.
- **MCP**: `src/mcp/` is a legacy optional adapter. Features must not exist only through MCP.
- **Output formats**: `--plain` (text), `--json` (versioned, `src/formatters/json-output.ts`), or interactive TUI;
  `src/utils/read-output-mode.ts` decides the mode (non-TTY falls back to plain).
- **Display language**: `src/i18n/` holds CLI text keyed by message ID (`en.ts` is the key source, `ja.ts` must cover
  every key). `BACKLOG_LANG=ja` switches `--help` command descriptions and `task list --plain` headings/default status
  names. Stored values, filters, and JSON stay English.

Task, draft, doc, decision, and milestone data are human-readable Markdown under `backlog/` (this repo dogfoods its own
backlog). Use the `backlog` CLI for mutations; do not edit those files directly.

## Tests

- Tests live in `src/test/` and use `bun:test`. CLI tests spawn the CLI via `getTestCliPath()` (`src/test/test-cli.ts`;
  `BACKLOG_TEST_CLI_BUNDLE` overrides it to test a built bundle) inside isolated directories from
  `createUniqueTestDir()` + `safeCleanup()` and `initializeTestProject()` in `src/test/test-utils.ts`. Never use the
  repository's live backlog as a fixture.
- Test public contracts and observable behavior; extend existing coverage instead of duplicating it. Do not weaken
  assertions, add retries, or raise timeouts to get a pass.

## Scope and workflow

- The explicit request is the scope. Do not add fallbacks, compatibility shims, extension points, or extra docs/tests
  that do not serve the requested result; propose them separately.
- Do not add subtitles or helper copy under UI headings/labels unless requested.
- Branch per task (e.g. `tasks/back-123-feature-name`); commit subject and PR title use `BACK-123 - Title of the task`.
  Every PR needs an associated Backlog task. Preserve unrelated working-tree changes; never revert or stage them.
- Backlog workflow: run `backlog instructions overview` at the start of a conversation, and the matching guide
  (`task-creation`, `task-execution`, `task-finalization`) before those lifecycle actions. Use
  `backlog <command> --help` before unfamiliar commands.
- Groma: before scanning or curating architecture, or changing files for a Backlog task, run `groma agent-instructions`
  and follow the guide it names. Do not edit Groma-owned architecture files directly.
