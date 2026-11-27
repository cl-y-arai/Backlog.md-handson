---
id: BACK-801
title: Translate remaining CLI help and the TUI into Japanese with BACKLOG_LANG
status: In Progress
assignee: []
created_date: '2026-11-27T05:25:00Z'
labels: []
dependencies: []
ordinal: 407000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
BACK-799 added BACKLOG_LANG=ja but left gaps: several top-level commands (task, draft, milestone, board, doc, decision, mcp) have no help description in any language, the plain task list empty-result messages stay English, and the interactive TUI (board, task list, overview, popups, composer) is English only. Japanese users switch between these surfaces constantly, so the partial translation is confusing. The browser UI is out of scope because it needs a separate way to pass the language to the browser.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Every top-level command shows a help description in English by default and in Japanese with BACKLOG_LANG=ja
- [ ] #2 With BACKLOG_LANG=ja, `task list --plain` empty-result messages are Japanese
- [ ] #3 With BACKLOG_LANG=ja, fixed TUI text (footers, help popup, filter header and popups, confirm popup, loading screens, board and task list labels and messages, task detail headings, task composer, overview, uninitialized root screen) is Japanese, and default status names are shown translated; custom statuses, task content, and error messages coming from the core are unchanged
- [ ] #4 TUI footer wrapping measures terminal display width, so full-width text does not overflow
- [ ] #5 English output is unchanged apart from the newly added command descriptions
- [ ] #6 Tests cover the new command descriptions, plain empty-result messages, and representative TUI text in both languages
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 bun run check:types passes when TypeScript touched
- [ ] #2 bun run check . passes when formatting/linting touched
- [ ] #3 bun test (or scoped test) passes
<!-- DOD:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Extend src/i18n with {param} interpolation and add keys for CLI descriptions, empty-result messages, and TUI text (grouped by area).
2. Add en/ja descriptions for task, draft, milestone, board, doc, decision, mcp.
3. Replace fixed TUI strings with t() in src/ui (footer, help, popups, filter header, loading, board, task viewer, unified view, composer, overview, root entry, lifecycle) and translate default statuses at render points only.
4. Make footer width measurement use display width.
5. Add tests; run types, Biome, and related TUI/CLI tests.
<!-- SECTION:PLAN:END -->
