export const drafts = {
	loading: "Loading drafts...",
	errorPrefix: "Error:",
	loadFailed: "Failed to load drafts",
	promoteFailed: "Failed to promote draft",
	title: "Draft Tasks",
	draftCount: (count: number) => `${count} draft${count !== 1 ? "s" : ""}`,
	newDraft: "+ New Draft",
	emptyTitle: "No drafts",
	emptyHint: "Draft tasks will appear here before they're promoted to the main backlog.",
	createdPrefix: "Created:",
	updatedPrefix: "Updated:",
	assignedTo: "Assigned to:",
	promoteToTask: "Promote to Task",
};

export type DraftsMessages = typeof drafts;
