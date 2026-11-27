/** English CLI copy. Its keys define every message that each locale must translate. */
export const en = {
	"program.description": "Backlog.md - Project management CLI",

	"command.init": "initialize backlog project in the current directory (or BACKLOG_CWD when set)",
	"command.search": "search tasks, documents, and decisions using the shared index",
	"command.board": "display tasks in a Kanban board",
	"command.agents": "manage the short Backlog.md CLI nudge in agent instruction files",
	"command.config": "manage backlog configuration",
	"command.doctor":
		"diagnose duplicate task, document, and decision IDs, report self-referential and cyclic dependencies, safely repair duplicate task IDs, and move archived tasks into the archive folder",
	"command.cleanup": "archive tasks in the final status that are older than a chosen age",
	"command.browser": "open browser interface on this machine only at 127.0.0.1 (press Ctrl+C or Cmd+C to stop)",
	"command.overview": "display project statistics and metrics",
	"command.completion": "manage shell completion scripts",
	"command.instructions": "show Backlog.md workflow instructions",

	"taskList.sortedHeading": "Tasks (sorted by priority):",
	"taskList.noStatus": "No Status",
	"taskList.noTasks": "No tasks found.",
	"taskList.noChildTasks": "No child tasks found for parent task {parentId}.",

	"tui.tasks": "Tasks",
	"tui.tasksPane": "Tasks ({count})",
	"tui.detailsPane": "Details",

	"status.To Do": "To Do",
	"status.In Progress": "In Progress",
	"status.Done": "Done",
} as const;

export type MessageKey = keyof typeof en;
