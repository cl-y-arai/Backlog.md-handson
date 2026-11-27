---
id: BACK-800
title: Add a standalone CLAUDE.md for Claude Code
status: Done
assignee: []
created_date: '2026-11-27T05:06:00Z'
updated_date: '2026-11-27T05:06:00Z'
labels: []
dependencies: []
ordinal: 406000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
CLAUDE.md was a symlink to AGENTS.md, and both are deleted in this working copy, so Claude Code sessions start without repository guidance. A standalone CLAUDE.md generated with /init gives future sessions the commands, the big-picture architecture, and the key working rules carried over from AGENTS.md and .github/copilot-instructions.md.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 CLAUDE.md lists the build, type-check, Biome, full-test, and single-test commands from package.json
- [x] #2 CLAUDE.md describes the CLI → Core → FileSystem/Git/Markdown flow and the TUI, browser, and MCP surfaces
- [x] #3 Every file and directory path referenced in CLAUDE.md exists in the repository
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [x] #1 bun run check:types passes when TypeScript touched
- [x] #2 bun run check . passes when formatting/linting touched
- [x] #3 bun test (or scoped test) passes
<!-- DOD:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Verification: every path referenced in CLAUDE.md exists (scripted check); commands match package.json scripts. Documentation-only change: no TypeScript or tests touched, so DoD type/lint/test items are trivially satisfied (bun run check clean on 483 files).
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added a standalone CLAUDE.md (generated via /init) replacing the former CLAUDE.md -> AGENTS.md symlink. It covers commands, the shared-model architecture across CLI/TUI/browser/MCP, test conventions, and key scope/workflow rules from AGENTS.md and copilot-instructions. AGENTS.md remains deleted in this working copy and is not part of this change.
<!-- SECTION:FINAL_SUMMARY:END -->
