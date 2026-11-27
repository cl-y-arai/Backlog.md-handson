import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdir } from "node:fs/promises";
import { $ } from "bun";
import { en } from "../i18n/en.ts";
import { resolveLanguage, translateStatus } from "../i18n/index.ts";
import { ja } from "../i18n/ja.ts";
import { Core } from "../index.ts";
import { getTestCliPath } from "./test-cli.ts";
import { createUniqueTestDir, initializeTestProject, safeCleanup } from "./test-utils.ts";

const CLI_PATH = getTestCliPath();

/** 呼び出し元の BACKLOG_LANG に左右されないよう、言語を明示した環境変数を作る。 */
function envWithLanguage(language: string | undefined): Record<string, string | undefined> {
	const { BACKLOG_LANG: _ignored, ...rest } = process.env;
	return language === undefined ? rest : { ...rest, BACKLOG_LANG: language };
}

describe("i18n language selection", () => {
	it("defaults to English when BACKLOG_LANG is unset or unsupported", () => {
		expect(resolveLanguage({})).toBe("en");
		expect(resolveLanguage({ BACKLOG_LANG: "" })).toBe("en");
		expect(resolveLanguage({ BACKLOG_LANG: "fr" })).toBe("en");
	});

	it("selects Japanese for BACKLOG_LANG=ja, ignoring case and surrounding spaces", () => {
		expect(resolveLanguage({ BACKLOG_LANG: "ja" })).toBe("ja");
		expect(resolveLanguage({ BACKLOG_LANG: " JA " })).toBe("ja");
	});

	it("translates only the default statuses and keeps custom statuses unchanged", () => {
		expect(translateStatus("To Do", "ja")).toBe("未着手");
		expect(translateStatus("In Progress", "ja")).toBe("進行中");
		expect(translateStatus("Done", "ja")).toBe("完了");
		expect(translateStatus("Review", "ja")).toBe("Review");
		expect(translateStatus("To Do", "en")).toBe("To Do");
	});

	it("provides a non-empty Japanese message for every English key", () => {
		for (const key of Object.keys(en) as Array<keyof typeof en>) {
			expect(ja[key]?.trim().length ?? 0).toBeGreaterThan(0);
		}
	});
});

describe("CLI display language", () => {
	let testDir: string;

	beforeEach(async () => {
		testDir = createUniqueTestDir("test-cli-i18n");
		await mkdir(testDir, { recursive: true });
		await $`git init -b main`.cwd(testDir).quiet();
		const core = new Core(testDir);
		await initializeTestProject(core, "I18n Test Project", true);
		await core.createTask(
			{
				id: "task-1",
				title: "First Task",
				status: "To Do",
				assignee: [],
				createdDate: "2025-06-08",
				labels: [],
				dependencies: [],
				rawContent: "",
				priority: "high",
			},
			false,
		);
		await core.createTask(
			{
				id: "task-2",
				title: "Second Task",
				status: "Done",
				assignee: [],
				createdDate: "2025-06-08",
				labels: [],
				dependencies: [],
				rawContent: "",
			},
			false,
		);
	});

	afterEach(async () => {
		await safeCleanup(testDir);
	});

	it("shows command descriptions in English by default and in Japanese with BACKLOG_LANG=ja", async () => {
		const english = await $`bun ${CLI_PATH} --help`.cwd(testDir).env(envWithLanguage(undefined)).quiet();
		expect(english.exitCode).toBe(0);
		expect(english.stdout.toString()).toContain(en["help.overview"]);

		const japanese = await $`bun ${CLI_PATH} --help`.cwd(testDir).env(envWithLanguage("ja")).quiet();
		expect(japanese.exitCode).toBe(0);
		const output = japanese.stdout.toString();
		expect(output).toContain(ja["help.program"]);
		expect(output).toContain(ja["help.overview"]);
		expect(output).not.toContain(en["help.overview"]);
	});

	it("shows Japanese status headings in plain task list output with BACKLOG_LANG=ja", async () => {
		const english = await $`bun ${CLI_PATH} task list --plain`.cwd(testDir).env(envWithLanguage(undefined)).quiet();
		expect(english.stdout.toString()).toContain("To Do:");

		const japanese = await $`bun ${CLI_PATH} task list --plain`.cwd(testDir).env(envWithLanguage("ja")).quiet();
		expect(japanese.exitCode).toBe(0);
		const output = japanese.stdout.toString();
		expect(output).toContain("未着手:");
		expect(output).toContain("完了:");
		expect(output).not.toContain("To Do:");
	});

	it("translates the priority-sorted heading and per-task status in Japanese", async () => {
		const result = await $`bun ${CLI_PATH} task list --plain --sort priority`
			.cwd(testDir)
			.env(envWithLanguage("ja"))
			.quiet();
		expect(result.exitCode).toBe(0);
		const output = result.stdout.toString();
		expect(output).toContain(ja["taskList.sortedHeading"]);
		expect(output).toContain("First Task (未着手)");
	});

	it("keeps stored status values in English for JSON output even with BACKLOG_LANG=ja", async () => {
		const result = await $`bun ${CLI_PATH} task list --json`.cwd(testDir).env(envWithLanguage("ja")).quiet();
		expect(result.exitCode).toBe(0);
		const output = result.stdout.toString();
		expect(output).toContain('"To Do"');
		expect(output).not.toContain("未着手");
	});
});
