import { t } from "../i18n/index.ts";

/**
 * Footer shortcut hints for the two task views.
 *
 * Letters are uppercase key indicators, not Shift chords: `[T]` means "press the T key".
 * The bound key is the lowercase letter (some actions also bind an explicit `S-` variant,
 * which is how Shift+letter is delivered). Filter letters are listed in the same order the
 * filter header renders its controls (status, type, project, priority, milestone, labels).
 * The project filter (`V`) is only bound when the project configures `projects:`, so it is
 * listed only when it is actually available, matching the help popup.
 */
function filterKeys(before: string[], after: string[], hasProjects: boolean): string {
	return [...before, ...(hasProjects ? ["V"] : []), ...after].join("/");
}

/** One footer hint: the key in cyan brackets followed by its (translated) label. */
export function keyHint(key: string, label: string): string {
	return `{cyan-fg}[${key}]{/} ${label}`;
}

/** Footer hints joined with " | " behind a leading space, the shape formatFooterContent splits on. */
export function footerLine(...segments: string[]): string {
	return ` ${segments.join(" | ")}`;
}

export function getBoardFooterContent(options: { hasProjects?: boolean } = {}): string {
	const keys = filterKeys(["T"], ["P", "I", "F"], options.hasProjects ?? false);
	return footerLine(
		keyHint("Tab", t("key.view")),
		keyHint("N", t("key.new")),
		keyHint("/", t("key.search")),
		keyHint(keys, t("key.filter")),
		keyHint("←→/↑↓", t("key.nav")),
		keyHint("Enter", t("key.details")),
		keyHint("E/M/A", t("key.editMoveArchive")),
		keyHint("Y", t("key.yank")),
		keyHint("?", t("key.help")),
		keyHint("q", t("key.quit")),
	);
}

export function getTaskListFooterContent(options: { hasProjects?: boolean } = {}): string {
	const keys = filterKeys(["S", "T"], ["P", "I", "L"], options.hasProjects ?? false);
	return footerLine(
		keyHint("Tab", t("key.view")),
		keyHint("/", t("key.search")),
		keyHint(keys, t("key.filter")),
		keyHint("↑↓", t("key.nav")),
		keyHint("E/A", t("key.editArchive")),
		keyHint("Y", t("key.yank")),
		keyHint("?", t("key.help")),
		keyHint("q", t("key.quit")),
	);
}

/** Hints shown while the filter header has focus; the search box gets its own cursor hints. */
export function getFilterFooterContent(focus: "search" | "control", context: "board" | "task-list"): string {
	if (focus === "search") {
		return footerLine(
			keyHint("←/→", t("key.cursorEdge")),
			keyHint("↑/↓", t(context === "board" ? "key.backToBoard" : "key.backToTasks")),
			keyHint("Esc", t("key.cancel")),
			`{gray-fg}${t("key.liveSearch")}{/}`,
		);
	}
	return footerLine(
		keyHint("Enter/Space", t("key.openPicker")),
		keyHint("←/→", t("key.prevNext")),
		keyHint("Esc", t("key.back")),
	);
}

// 全角文字は端末上で2桁使うため、文字数ではなく表示幅で測る
function visibleLength(value: string): number {
	return Bun.stringWidth(value.replace(/\{[^{}]+\}/g, ""));
}

function joinSegments(segments: string[], leadingSpace: boolean): string {
	const joined = segments.join(" | ");
	return leadingSpace ? ` ${joined}` : joined;
}

export function formatFooterContent(
	content: string,
	terminalWidth: number,
): {
	content: string;
	height: 1 | 2;
} {
	const trimmed = content.trim();
	if (!trimmed) {
		return { content: "", height: 1 };
	}

	const segments = trimmed.split(/\s+\|\s+/).filter((segment) => segment.length > 0);
	if (segments.length <= 1) {
		return { content, height: 1 };
	}

	const availableWidth = Math.max(20, terminalWidth - 1);
	const leadingSpace = content.startsWith(" ");
	const singleLine = joinSegments(segments, leadingSpace);

	if (visibleLength(singleLine) <= availableWidth) {
		return { content: singleLine, height: 1 };
	}

	// Progressive wrapping: keep extending line 1 until adding the next section
	// would overflow available width, then place all remaining sections on line 2.
	let splitAt = 1;
	let firstLine = joinSegments(segments.slice(0, splitAt), leadingSpace);
	for (let index = 1; index < segments.length; index += 1) {
		const candidate = joinSegments(segments.slice(0, index + 1), leadingSpace);
		if (visibleLength(candidate) > availableWidth) {
			break;
		}
		splitAt = index + 1;
		firstLine = candidate;
	}

	if (splitAt >= segments.length) {
		return { content: firstLine, height: 1 };
	}

	const secondLine = joinSegments(segments.slice(splitAt), leadingSpace);
	return { content: `${firstLine}\n${secondLine}`, height: 2 };
}
