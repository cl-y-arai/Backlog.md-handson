import { defineMessages } from "../locale.ts";

/** Labels shared across the browser UI. Area files hold everything else. */
export const commonMessages = defineMessages(
	{
		"common.status.To Do": "To Do",
		"common.status.In Progress": "In Progress",
		"common.status.Done": "Done",
		"common.document.title": "Backlog.md - Task Management",
	},
	{
		"common.status.To Do": "未着手",
		"common.status.In Progress": "進行中",
		"common.status.Done": "完了",
		"common.document.title": "Backlog.md - タスク管理",
	},
);
