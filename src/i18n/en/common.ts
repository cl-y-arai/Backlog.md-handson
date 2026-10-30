/** Generic words reused across many screens. Screen-specific text belongs in that screen's namespace. */
export const common = {
	add: "Add",
	apply: "Apply",
	archive: "Archive",
	back: "Back",
	cancel: "Cancel",
	clear: "Clear",
	close: "Close",
	confirm: "Confirm",
	create: "Create",
	delete: "Delete",
	dismiss: "Dismiss",
	edit: "Edit",
	error: "Error",
	loading: "Loading...",
	no: "No",
	none: "None",
	relativeDate: {
		today: "today",
		yesterday: "yesterday",
		daysAgo: (days: number) => `${days}d ago`,
	},
	remove: "Remove",
	retry: "Retry",
	save: "Save",
	saving: "Saving...",
	search: "Search",
	yes: "Yes",
};

export type CommonMessages = typeof common;
