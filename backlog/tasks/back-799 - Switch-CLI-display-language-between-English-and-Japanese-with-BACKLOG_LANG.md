---
id: BACK-799
title: Switch CLI display language between English and Japanese with BACKLOG_LANG
status: Done
assignee: []
created_date: '2026-11-27T05:06:00Z'
updated_date: '2026-11-27T05:06:00Z'
labels: []
dependencies: []
ordinal: 405000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Japanese-speaking users read help and task lists in English only. As a first step, let them switch the CLI display language with an environment variable, starting with the top-level help command descriptions and the plain task list. Stored task data, filters, and JSON must stay unchanged so scripts and files are unaffected.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 With BACKLOG_LANG=ja, `backlog --help` shows the top-level command descriptions in Japanese; unset or unsupported values keep English
- [x] #2 With BACKLOG_LANG=ja, `backlog task list --plain` shows status section headings, the priority-sorted heading, and per-task status in Japanese for the default statuses (To Do, In Progress, Done); custom statuses are shown unchanged
- [x] #3 `--json` output, stored task files, and `--status` filter values stay in English
- [x] #4 CLI text for both languages lives in src/i18n/, and the Japanese table must cover every English message key
- [x] #5 Tests in src/test/ cover language selection, help output, plain task list output, and unchanged JSON
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [x] #1 bun run check:types passes when TypeScript touched
- [x] #2 bun run check . passes when formatting/linting touched
- [x] #3 bun test (or scoped test) passes
<!-- DOD:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add src/i18n/ (en.ts as key source, ja.ts, index.ts with resolveLanguage, t, translateStatus).
2. Replace top-level command descriptions in src/cli.ts, src/commands/completion.ts, src/commands/instructions.ts with t().
3. Translate plain task list headings and default status display in printTaskSections/formatPlainTaskListRow.
4. Add src/test/cli-i18n.test.ts.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Verification: src/test/cli-i18n.test.ts 8 pass; task-list-order.test.ts + cli-task-list.test.ts 26 pass; bun run check:types no errors; bun run check (483 files) clean. Manual: BACKLOG_LANG=ja task list --plain -s "In Progress" filters by the English value and shows the heading as 進行中; -s 進行中 matches nothing.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added src/i18n/ (en.ts key source, ja.ts, index.ts) and BACKLOG_LANG=ja (default en) to switch the display language. Top-level `backlog --help` command descriptions and `task list --plain` headings plus default status names (To Do/In Progress/Done) are shown in Japanese; custom statuses, stored files, --status filters, and --json stay English. Follow-ups (not done): commands without descriptions (task, draft, board, doc, decision, milestone, mcp), "No tasks found.", and the interactive TUI/browser are not translated. Users see Japanese status names but must filter with English values.
<!-- SECTION:FINAL_SUMMARY:END -->
