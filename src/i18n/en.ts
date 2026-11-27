/**
 * English CLI text. This is the default language and the source of every message key:
 * other languages must translate each key defined here.
 */
export const en = {
	// `backlog --help` のコマンド説明
	"help.program": "Backlog.md - Project management CLI",
	"help.init": "initialize backlog project in the current directory (or BACKLOG_CWD when set)",
	"help.search": "search tasks, documents, and decisions using the shared index",
	"help.agents": "manage the short Backlog.md CLI nudge in agent instruction files",
	"help.config": "manage backlog configuration",
	"help.doctor":
		"diagnose duplicate task, document, and decision IDs, report self-referential and cyclic dependencies, safely repair duplicate task IDs, and move archived tasks into the archive folder",
	"help.cleanup": "archive tasks in the final status that are older than a chosen age",
	"help.browser": "open browser interface on this machine only at 127.0.0.1 (press Ctrl+C or Cmd+C to stop)",
	"help.overview": "display project statistics and metrics",
	"help.completion": "manage shell completion scripts",
	"help.instructions": "show Backlog.md workflow instructions",

	// `backlog task list --plain` の見出し
	"taskList.sortedHeading": "Tasks (sorted by priority):",
	"taskList.noStatus": "No Status",

	// 既定ステータスの表示名（config やファイルに保存される値は英語のまま）
	"status.To Do": "To Do",
	"status.In Progress": "In Progress",
	"status.Done": "Done",
} as const;

export type MessageKey = keyof typeof en;
