import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { BACKLOG_LANG_ENV } from "../i18n/index.ts";
import type { Task } from "../types/index.ts";
import { getHelpShortcuts } from "../ui/components/help-popup.ts";
import { getTaskComposerStatusChoices } from "../ui/components/task-composer.ts";
import { formatFooterContent, getBoardFooterContent, getTaskListFooterContent } from "../ui/footer-content.ts";
import { formatRootEntry } from "../ui/root-entry.ts";
import { formatArchiveConfirmation } from "../ui/task-lifecycle.ts";
import { generateDetailContent } from "../ui/task-viewer-with-search.ts";

const createTask = (overrides: Partial<Task> = {}): Task => ({
	id: "TASK-1",
	title: "Sample task",
	status: "In Progress",
	assignee: [],
	createdDate: "2025-06-08",
	labels: [],
	dependencies: [],
	...overrides,
});

// 表示言語は呼び出しごとに環境変数から読むので、テストごとに設定して元に戻す
let savedLanguage: string | undefined;

function useLanguage(language: string | undefined): void {
	if (language === undefined) delete process.env[BACKLOG_LANG_ENV];
	else process.env[BACKLOG_LANG_ENV] = language;
}

beforeEach(() => {
	savedLanguage = process.env[BACKLOG_LANG_ENV];
});

afterEach(() => {
	useLanguage(savedLanguage);
});

describe("TUI text in Japanese", () => {
	beforeEach(() => useLanguage("ja"));

	it("shows footer hints in Japanese while keeping the key names", () => {
		const board = getBoardFooterContent();
		expect(board).toContain("{cyan-fg}[Tab]{/} 表示切替");
		expect(board).toContain("{cyan-fg}[q]{/} 終了");
		expect(getTaskListFooterContent()).toContain("{cyan-fg}[E/A]{/} 編集/アーカイブ");
	});

	it("wraps a Japanese footer by display width, not character count", () => {
		const content = getBoardFooterContent();
		const visible = content.replace(/\{[^{}]+\}/g, "");
		// 文字数では収まるが表示幅では収まらない幅を選ぶ
		const width = visible.length + 2;
		expect(Bun.stringWidth(visible)).toBeGreaterThan(width);
		expect(formatFooterContent(content, width).height).toBe(2);
	});

	it("describes every help shortcut in Japanese", () => {
		const shortcuts = getHelpShortcuts("board", { hasProjects: true });
		expect(shortcuts.find((shortcut) => shortcut.key === "N")?.desc).toBe("タスクを作成する");
		expect(shortcuts.find((shortcut) => shortcut.key === "V")?.desc).toBe("プロジェクトで絞り込む");
	});

	it("shows default statuses translated in the composer while keeping stored values", () => {
		const choices = getTaskComposerStatusChoices(["To Do", "Review", "Done"]);
		expect(choices).toContainEqual({ label: "未着手", value: "To Do" });
		expect(choices).toContainEqual({ label: "Review", value: "Review" });
		expect(choices).toContainEqual({ label: "完了", value: "Done" });
	});

	it("shows task detail headings and the status in Japanese, leaving task content as written", () => {
		const { headerContent, bodyContent } = generateDetailContent(createTask({ description: "Plain description" }));
		const header = headerContent.join("\n");
		const body = bodyContent.join("\n");
		expect(header).toContain("進行中");
		expect(header).toContain("Sample task");
		expect(body).toContain("説明");
		expect(body).toContain("受け入れ基準");
		expect(body).toContain("Plain description");
	});

	it("asks the archive question in Japanese", () => {
		expect(formatArchiveConfirmation("TASK-1")).toContain("{bold}TASK-1{/bold} をアーカイブしますか？");
	});

	it("shows the uninitialized root screen in Japanese", () => {
		const output = formatRootEntry({ version: "1.0.0", initialized: false });
		expect(output).toContain("このディレクトリは Backlog.md 用に初期化されていません。");
		expect(output).toContain("backlog init --defaults");
	});
});

describe("TUI text in English", () => {
	beforeEach(() => useLanguage(undefined));

	it("keeps the English footer, composer choices, and detail headings", () => {
		expect(getBoardFooterContent()).toContain("{cyan-fg}[Tab]{/} View");
		expect(getTaskComposerStatusChoices(["To Do"])).toContainEqual({ label: "To Do", value: "To Do" });
		expect(generateDetailContent(createTask()).bodyContent.join("\n")).toContain("Acceptance Criteria");
	});
});
