export const app = {
	loading: "Loading",
	documentTitle: (projectName: string) => `${projectName} - Task Management`,
	loadDataFailed: "Failed to load data",
	archiveCommitFailed: "The task was archived, but committing the change failed. Check the repository before retrying.",
	taskCreated: (isDraft: boolean, title: string, id: string) =>
		`${isDraft ? "Draft" : "Task"} "${title}" created successfully! (${id})`,
	taskRoute: {
		invalidLink: "That task link is not valid.",
		invalidTaskId: (taskId: string) => `"${taskId}" is not a valid task ID.`,
		ambiguous: (taskId: string) => `Task "${taskId}" is ambiguous. Repair duplicate task IDs before opening this link.`,
		notFound: (taskId: string) => `Task "${taskId}" was not found.`,
		openFailed: (taskId: string) => `Task "${taskId}" could not be opened. Try again.`,
	},
};

export type AppMessages = typeof app;
