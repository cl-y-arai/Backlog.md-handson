import type { ScreenInterface } from "neo-neo-bblessed";
import type { MessageKey } from "../../i18n/en.ts";
import { t } from "../../i18n/index.ts";
import { footerLine, keyHint } from "../footer-content.ts";
import { createPopupChrome, createScrollableViewport } from "./filter-popup.ts";

export type HelpPopupContext = "board" | "task-list";

type Shortcut = {
	key: string;
	desc: string;
};

type ShortcutDefinition = {
	key: string;
	descKey: MessageKey;
};

// Letters are uppercase key indicators, matching the footer: `T` means "press the T key",
// not Shift+T. The bound key is the lowercase letter.
const BOARD_SHORTCUTS: ShortcutDefinition[] = [
	{ key: "Tab", descKey: "shortcut.switchView" },
	{ key: "N", descKey: "shortcut.createTask" },
	{ key: "/", descKey: "shortcut.searchTasks" },
	{ key: "T", descKey: "shortcut.filterType" },
	{ key: "V", descKey: "shortcut.filterProject" },
	{ key: "P", descKey: "shortcut.filterPriority" },
	{ key: "I", descKey: "shortcut.filterMilestone" },
	{ key: "F", descKey: "shortcut.filterLabels" },
	{ key: "←→", descKey: "shortcut.navigateColumns" },
	{ key: "↑↓", descKey: "shortcut.navigateTasks" },
	{ key: "Enter", descKey: "shortcut.viewDetails" },
	{ key: "E", descKey: "shortcut.editTask" },
	{ key: "M", descKey: "shortcut.moveTasks" },
	{ key: "A", descKey: "shortcut.archiveTask" },
	{ key: "Y", descKey: "shortcut.yankId" },
	{ key: "H", descKey: "shortcut.toggleEmptyColumns" },
	{ key: "?", descKey: "shortcut.showHelp" },
	{ key: "q/Esc", descKey: "shortcut.quit" },
];

const TASK_LIST_SHORTCUTS: ShortcutDefinition[] = [
	{ key: "Tab", descKey: "shortcut.switchView" },
	{ key: "/", descKey: "shortcut.searchTasks" },
	{ key: "S", descKey: "shortcut.filterStatus" },
	{ key: "T", descKey: "shortcut.filterType" },
	{ key: "V", descKey: "shortcut.filterProject" },
	{ key: "P", descKey: "shortcut.filterPriority" },
	{ key: "I", descKey: "shortcut.filterMilestone" },
	{ key: "L", descKey: "shortcut.filterLabels" },
	{ key: "↑↓", descKey: "shortcut.navigateTasks" },
	{ key: "←→", descKey: "shortcut.switchListDetails" },
	{ key: "Enter", descKey: "shortcut.focusDetails" },
	{ key: "E", descKey: "shortcut.editTask" },
	{ key: "A", descKey: "shortcut.archiveTask" },
	{ key: "Y", descKey: "shortcut.yankId" },
	{ key: "?", descKey: "shortcut.showHelp" },
	{ key: "q/Esc", descKey: "shortcut.quit" },
];

export function getHelpShortcuts(
	context: HelpPopupContext = "board",
	options: { hasProjects?: boolean } = {},
): Shortcut[] {
	const definitions = context === "task-list" ? TASK_LIST_SHORTCUTS : BOARD_SHORTCUTS;
	const shortcuts = definitions.map(({ key, descKey }) => ({ key, desc: t(descKey) }));
	return options.hasProjects ? shortcuts : shortcuts.filter((shortcut) => shortcut.key !== "V");
}

/** Popup rows spent on borders, the top spacer and the help line, leaving one row per shortcut. */
const HELP_POPUP_CHROME_ROWS = 4;
const HELP_POPUP_WIDTH = 60;

function getHelpText(scrolls: boolean): string {
	const close = keyHint("Esc/q", t("key.closeHelp"));
	return scrolls ? footerLine(keyHint("↑↓", t("key.scroll")), close) : footerLine(close);
}

export function getHelpPopupHeight(shortcutCount: number, screenHeight: number): number {
	const boundedScreenHeight = Math.max(1, screenHeight);
	const preferredHeight = Math.max(5, Math.min(shortcutCount + HELP_POPUP_CHROME_ROWS, boundedScreenHeight - 2));
	return Math.min(boundedScreenHeight, preferredHeight);
}

export async function openHelpPopup(
	screen: ScreenInterface,
	context: HelpPopupContext = "board",
	options: { hasProjects?: boolean } = {},
): Promise<void> {
	return new Promise<void>((resolve) => {
		let settled = false;
		const shortcuts = getHelpShortcuts(context, options);
		let popupHeight = getHelpPopupHeight(shortcuts.length, screen.height);
		const { popup, close, reflow } = createPopupChrome({
			screen,
			title: t("shortcut.title"),
			helpText: getHelpText(false),
			width: HELP_POPUP_WIDTH,
			height: popupHeight,
		});

		const content = shortcuts.map((s) => `{cyan-fg}[${s.key.padStart(5)}]{/} ${s.desc}`).join("\n");

		// Terminals too short for every shortcut keep the remaining rows reachable by scrolling.
		const contentBox = createScrollableViewport({
			parent: popup,
			top: 1,
			left: 2,
			right: 2,
			bottom: 1,
			content,
			tags: true,
		});
		const getMaxScrollOffset = () => {
			const visibleRows =
				typeof contentBox.height === "number" ? contentBox.height : popupHeight - HELP_POPUP_CHROME_ROWS;
			return Math.max(0, contentBox.getScrollHeight() - Math.max(1, visibleRows));
		};
		const applyLayout = () => {
			popupHeight = getHelpPopupHeight(shortcuts.length, screen.height);
			reflow(HELP_POPUP_WIDTH, popupHeight);
			// Rendering reparses the content at its new width, producing the exact number of
			// visual rows after tag removal and wrapping.
			screen.render();
			const maxOffset = getMaxScrollOffset();
			contentBox.childBase = Math.min(maxOffset, Math.max(0, contentBox.childBase));
			reflow(HELP_POPUP_WIDTH, popupHeight, getHelpText(maxOffset > 0));
			screen.render();
		};
		const onResize = () => {
			if (!settled) applyLayout();
		};

		const finish = () => {
			if (settled) return;
			settled = true;
			(
				screen as ScreenInterface & {
					removeListener(event: string, listener: (...args: unknown[]) => void): void;
				}
			).removeListener("resize", onResize);
			close();
			screen.render();
			resolve();
		};

		popup.key(["escape", "q", "Q", "?"], () => {
			finish();
			return false;
		});

		const scrollBy = (delta: number) => {
			const maxOffset = getMaxScrollOffset();
			contentBox.childBase = Math.min(maxOffset, Math.max(0, contentBox.childBase + delta));
			screen.render();
			return false;
		};
		popup.key(["up"], () => scrollBy(-1));
		popup.key(["down"], () => scrollBy(1));
		screen.on("resize", onResize);

		setImmediate(() => {
			if (settled) return;
			popup.focus();
			applyLayout();
		});
	});
}
