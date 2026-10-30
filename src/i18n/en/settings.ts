export const settings = {
	title: "Settings",
	loading: "Loading settings...",
	loadFailed: "Failed to load configuration",
	saveFailed: "Failed to save configuration",
	saveChanges: "Save Changes",
	savedSuccess: "Settings saved successfully!",
	validation: {
		projectNameRequired: "Project name is required",
		portRange: "Port must be between 1 and 65535",
	},
	project: {
		heading: "Project Settings",
		projectName: "Project Name",
		dateFormat: "Date Format",
		dateFormatHelp:
			"Controls how dates are displayed in the web UI and TUI. Dates in markdown files are always stored as yyyy-mm-dd.",
	},
	workflow: {
		heading: "Workflow Settings",
		autoCommit: "Auto Commit",
		autoCommitHelp: "Automatically commit changes to Git after task operations",
		remoteOperations: "Remote Operations",
		remoteOperationsHelp: "Fetch tasks information from remote branches",
		defaultStatus: "Default Status",
		defaultStatusHelp: "Default status for new tasks",
		defaultEditor: "Default Editor",
		defaultEditorPlaceholder: "e.g., vim, nano, code",
		defaultEditorHelp: "Editor command to use for editing tasks (overrides EDITOR environment variable)",
	},
	definitionOfDone: {
		heading: "Definition of Done Defaults",
		description: "These checklist items are added to new tasks by default.",
		itemPlaceholder: "Checklist item",
		addItem: "+ Add item",
	},
	webUi: {
		heading: "Web UI Settings",
		defaultPort: "Default Port",
		autoOpenBrowser: "Auto Open Browser",
		autoOpenBrowserHelp: "Automatically open browser when starting web UI",
		hideEmptyColumns: "Hide Empty Columns",
		hideEmptyColumnsHelp:
			"Hide board columns whose status has no tasks. Columns reappear while dragging a task so they remain valid drop targets.",
	},
	advanced: {
		heading: "Advanced Settings",
		maxColumnWidth: "Max Column Width",
		maxColumnWidthHelp: "Maximum width for text columns in CLI output",
		taskResolutionStrategy: "Task Resolution Strategy",
		mostRecent: "Most Recent",
		mostProgressed: "Most Progressed",
		taskResolutionStrategyHelp: "Strategy for resolving conflicts when tasks exist in multiple branches",
		zeroPaddedIds: "Zero-Padded IDs",
		zeroPaddedIdsHelp: "Number of digits for ID padding (0 = disabled, 3 = task-001, 4 = task-0001)",
		taskPrefix: "Task Prefix",
		readOnly: "(read-only)",
		taskPrefixHelp: "Set during initialization. Cannot be changed to avoid breaking existing task IDs.",
	},
};

export type SettingsMessages = typeof settings;
