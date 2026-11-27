import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { $ } from "bun";
import { localizeStatus, resolveLocale } from "../i18n/index.ts";
import { Core } from "../index.ts";
import { getTestCliPath } from "./test-cli.ts";
import { createTestDirOutsideRepository, initializeTestProject, safeCleanup } from "./test-utils.ts";

const CLI_PATH = getTestCliPath();
let TEST_DIR: string;

async function runCli(args: string[], lang?: string): Promise<string> {
	const env = { ...process.env };
	delete env.BACKLOG_LANG;
	if (lang !== undefined) env.BACKLOG_LANG = lang;
	const result = await $`bun ${[CLI_PATH, ...args]}`.cwd(TEST_DIR).env(env).quiet().nothrow();
	expect(result.exitCode).toBe(0);
	return result.stdout.toString();
}

describe("BACKLOG_LANG", () => {
	describe("locale resolution", () => {
		it("selects Japanese only for ja, case-insensitively, and English otherwise", () => {
			expect(resolveLocale({ BACKLOG_LANG: "ja" })).toBe("ja");
			expect(resolveLocale({ BACKLOG_LANG: " JA " })).toBe("ja");
			expect(resolveLocale({})).toBe("en");
			expect(resolveLocale({ BACKLOG_LANG: "en" })).toBe("en");
			expect(resolveLocale({ BACKLOG_LANG: "fr" })).toBe("en");
		});

		it("translates default statuses and leaves custom statuses as the user wrote them", () => {
			const previous = process.env.BACKLOG_LANG;
			process.env.BACKLOG_LANG = "ja";
			try {
				expect(localizeStatus("In Progress")).toBe("進行中");
				expect(localizeStatus("Review")).toBe("Review");
			} finally {
				if (previous === undefined) delete process.env.BACKLOG_LANG;
				else process.env.BACKLOG_LANG = previous;
			}
		});
	});

	describe("CLI output", () => {
		beforeEach(async () => {
			TEST_DIR = await createTestDirOutsideRepository("test-cli-language");
			await $`git init -b main`.cwd(TEST_DIR).quiet();
			const core = new Core(TEST_DIR);
			await initializeTestProject(core, "Language Test Project", false);
			await runCli(["task", "create", "Write docs"]);
			await runCli(["task", "create", "Ship release", "-s", "Done", "--priority", "high"]);
		});

		afterEach(async () => {
			await safeCleanup(TEST_DIR);
		});

		it("prints task list status headings in Japanese with BACKLOG_LANG=ja", async () => {
			const output = await runCli(["task", "list", "--plain"], "ja");
			expect(output).toContain("未着手:\n  TASK-1 - Write docs");
			expect(output).toContain("完了:\n  [HIGH] TASK-2 - Ship release");
			expect(output).not.toContain("To Do:");
		});

		it("prints the sorted task list heading and row statuses in Japanese", async () => {
			const output = await runCli(["task", "list", "--plain", "--sort", "priority"], "ja");
			expect(output).toContain("タスク（優先度順）:");
			expect(output).toContain("TASK-2 - Ship release (完了)");
			expect(output).toContain("TASK-1 - Write docs (未着手)");
		});

		it("reports an empty task list in Japanese", async () => {
			const output = await runCli(["task", "list", "--plain", "--search", "no-such-task"], "ja");
			expect(output).toBe("タスクが見つかりません。\n");
		});

		it("keeps English output when BACKLOG_LANG is unset or unsupported", async () => {
			for (const lang of [undefined, "fr"]) {
				const output = await runCli(["task", "list", "--plain"], lang);
				expect(output).toContain("To Do:\n  TASK-1 - Write docs");
				expect(output).toContain("Done:\n  [HIGH] TASK-2 - Ship release");
			}
		});

		it("does not translate JSON output", async () => {
			const output = await runCli(["task", "list", "--json"], "ja");
			expect(output).toContain('"status": "To Do"');
			expect(output).not.toContain("未着手");
		});

		it("shows command descriptions in backlog --help in the selected language", async () => {
			const japanese = await runCli(["--help"], "ja");
			expect(japanese).toContain("Backlog.md - プロジェクト管理 CLI");
			expect(japanese).toContain("タスクをカンバンボードで表示する");
			expect(japanese).not.toContain("display tasks in a Kanban board");

			const english = await runCli(["--help"]);
			expect(english).toContain("Backlog.md - Project management CLI");
			expect(english).toContain("display tasks in a Kanban board");
		});
	});
});
