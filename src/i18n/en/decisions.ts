export const decisions = {
	editorPlaceholder: "Write your decision documentation here...",
	saveFailedFallback: "Failed to save decision.",
	noneSelectedTitle: "No decision selected",
	noneSelectedHint: "Select a decision from the sidebar to view its content.",
	titlePlaceholder: "Decision title",
	fallbackTitle: (id: string) => `Decision ${id}`,
	typeLabel: "Decision",
	dateLabel: "Date:",
	/** Display labels for known decision statuses; unknown statuses are shown capitalized. */
	statusLabels: {
		proposed: "Proposed",
		accepted: "Accepted",
		rejected: "Rejected",
		superseded: "Superseded",
	} as Record<string, string>,
	savedToast: (title: string) => `Decision "${title}" saved successfully!`,
	/** Noun used in the shared archive messages. */
	archiveNoun: "decision",
};

export type DecisionsMessages = typeof decisions;
