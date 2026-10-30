export const system = {
	errorBoundary: {
		title: "Something went wrong",
		description: "An unexpected error occurred. Please try refreshing the page.",
		technicalDetails: "Technical Details",
		tryAgain: "Try Again",
	},
	modal: {
		close: "Close modal",
	},
	health: {
		serverDisconnected: "Server disconnected",
		connectionRestored: "Connection restored!",
	},
	branchIndexing: {
		indexing: "Indexing branches",
	},
	duplicateIds: {
		warningLabel: "Duplicate task IDs:",
		warningSummary: (groupCount: number, fileCount: number) =>
			`${groupCount} ${groupCount === 1 ? "group" : "groups"} across ${fileCount} files. Some tasks may be hidden.`,
		reviewRepair: "Review repair",
		dismissWarning: "Dismiss duplicate task ID warning",
		repairTitle: "Repair duplicate task IDs",
		repairIntro: (groupCount: number) =>
			`Backlog.md found ${groupCount} duplicate ID ${groupCount === 1 ? "group" : "groups"}. The repair keeps one file in each group at its current ID and assigns new incremental IDs to the others.`,
		filesToRename: "Files to rename",
		referencesRequiringReview: (count: number) => `References requiring review: ${count}`,
		referenceScanIncomplete: "Reference scan incomplete",
		referencesNotChanged:
			"References are not changed automatically because an old duplicate ID does not identify which task was meant.",
		referenceScanBlocked:
			"Backlog.md could not inspect every Markdown file, so automatic repair is blocked until the failures below are resolved.",
		repairBlocked: "Automatic repair is blocked",
		confirmRepair: "Confirm repair",
		confirmRenameQuestion: (count: number) =>
			`Rename ${count} task ${count === 1 ? "file" : "files"} now? Task content is preserved; only each selected filename and frontmatter ID change.`,
		continue: "Continue",
		repairing: "Repairing…",
		repairFiles: (count: number) => `Repair ${count} ${count === 1 ? "file" : "files"}`,
		repairFailed: "Duplicate task ID repair failed.",
	},
};

export type SystemMessages = typeof system;
