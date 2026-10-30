export const documents = {
	editorPlaceholder: "Write your documentation here...",
	notFound: (id: string) => `Document with ID "${id}" not found`,
	loadFailed: "Failed to load document",
	titleRequired: "Document title is required",
	saveFailedFallback: "Failed to save document",
	noneSelectedTitle: "No document selected",
	noneSelectedHint: "Select a document from the sidebar to view its content.",
	titlePlaceholder: "Document title",
	fallbackTitle: (id: string) => `Document ${id}`,
	typeLabel: "Documentation",
	createdLabel: "Created:",
	saveFailed: (message: string) => `Failed to save: ${message}`,
	savedToast: (title: string) => `Document "${title}" saved successfully!`,
	/** Noun used in the shared archive messages. */
	archiveNoun: "document",
	/** Shared by the document and decision pages (RecordArchive.tsx). */
	recordArchive: {
		archivedLabel: "Archived",
		confirm: (title: string, restoreCommand: string) =>
			`Archive "${title}"? It leaves the sidebar and search. Restore it from the CLI with: ${restoreCommand}`,
		commitFailed: (noun: string) =>
			`The ${noun} was archived, but committing the change failed. Check the repository before retrying.`,
	},
};

export type DocumentsMessages = typeof documents;
