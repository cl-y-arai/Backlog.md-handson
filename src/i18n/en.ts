export const en = {
	common: {
		loading: "Loading...",
		poweredBy: "powered by",
		retry: "Retry",
		language: "Language",
	},
	theme: {
		switchToDark: "Switch to dark mode",
		switchToLight: "Switch to light mode",
	},
	nav: {
		searchPlaceholder: "Search (⌘K)...",
		searchTitle: "Search (⌘K)",
		searchResults: "Search Results",
		searching: "Searching…",
		loadingContent: "Loading content",
		loadFailed: "Failed to load navigation",
		loadFailedRetry: "Failed to load navigation. Retry",
		expandSidebar: "Expand sidebar",
		collapseSidebar: "Collapse sidebar",
		tasks: "Tasks",
		kanbanBoard: "Kanban Board",
		allTasks: "All Tasks",
		milestones: "Milestones",
		drafts: "Drafts",
		statistics: "Statistics",
		documents: "Documents",
		documentsUnavailable: "Documents unavailable",
		noDocuments: "No documents",
		createDocument: "Create new document",
		decisions: "Decisions",
		decisionsUnavailable: "Decisions unavailable",
		noDecisions: "No decisions",
		settings: "Settings",
		loadingCount: "Loading {label} count",
		countUnavailable: "{label} count unavailable",
		countLabel: { task: "task", document: "document", decision: "decision" },
	},
	board: {
		title: "Kanban Board",
		failedToLoad: "Failed to load tasks",
	},
	taskList: {
		title: "All Tasks",
	},
} as const;

type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };

export type Messages = Widen<typeof en>;
