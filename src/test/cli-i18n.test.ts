import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdir } from "node:fs/promises";
import { $ } from "bun";
import { Core } from "../index.ts";
import { getTestCliPath } from "./test-cli.ts";
import { createUniqueTestDir, initializeTestProject, safeCleanup } from "./test-utils.ts";

let TEST_DIR: string;
const CLI_PATH = getTestCliPath();

describe("CLI i18n (BACKLOG_LANG)", () => {
	beforeEach(async () => {
		TEST_DIR = createUniqueTestDir("test-cli-i18n");
		await mkdir(TEST_DIR, { recursive: true });
		await $`git init -b main`.cwd(TEST_DIR).quiet();
		const core = new Core(TEST_DIR);
		await initializeTestProject(core, "I18n Test Project", true);
	});

	afterEach(async () => {
		await safeCleanup(TEST_DIR);
	});

	describe("backlog --help", () => {
		it("shows the English root description by default", async () => {
			const result = await $`bun ${CLI_PATH} --help`.cwd(TEST_DIR).quiet();
			expect(result.exitCode).toBe(0);
			expect(result.stdout.toString()).toContain("Backlog.md - Project management CLI");
		});

		it("shows the Japanese root description when BACKLOG_LANG=ja", async () => {
			const result = await $`bun ${CLI_PATH} --help`.cwd(TEST_DIR).env({ ...process.env, BACKLOG_LANG: "ja" }).quiet();
			expect(result.exitCode).toBe(0);
			expect(result.stdout.toString()).toContain("Backlog.md - プロジェクト管理 CLI");
		});

		it("falls back to English for an unknown BACKLOG_LANG value", async () => {
			const result = await $`bun ${CLI_PATH} --help`.cwd(TEST_DIR).env({ ...process.env, BACKLOG_LANG: "fr" }).quiet();
			expect(result.exitCode).toBe(0);
			expect(result.stdout.toString()).toContain("Backlog.md - Project management CLI");
		});
	});

	describe("backlog task list --help", () => {
		it("shows the Japanese subcommand description when BACKLOG_LANG=ja", async () => {
			const result = await $`bun ${[CLI_PATH, "task", "list", "--help"]}`
				.cwd(TEST_DIR)
				.env({ ...process.env, BACKLOG_LANG: "ja" })
				.quiet();
			expect(result.exitCode).toBe(0);
			expect(result.stdout.toString()).toContain("ステータスごとにタスクを一覧表示する");
		});
	});

	describe("backlog task list output", () => {
		it("translates headings and the empty-list message when BACKLOG_LANG=ja", async () => {
			const result = await $`bun ${[CLI_PATH, "task", "list", "--plain"]}`
				.cwd(TEST_DIR)
				.env({ ...process.env, BACKLOG_LANG: "ja" })
				.quiet();
			expect(result.exitCode).toBe(0);
			expect(result.stdout.toString()).toContain("タスクが見つかりません。");
		});

		it("keeps status values from config untranslated even when BACKLOG_LANG=ja", async () => {
			const core = new Core(TEST_DIR);
			await core.createTask(
				{
					id: "task-1",
					title: "First Task",
					status: "To Do",
					assignee: [],
					createdDate: "2025-06-08",
					labels: [],
					dependencies: [],
					rawContent: "First test task",
				},
				false,
			);

			const result = await $`bun ${[CLI_PATH, "task", "list", "--plain"]}`
				.cwd(TEST_DIR)
				.env({ ...process.env, BACKLOG_LANG: "ja" })
				.quiet();
			expect(result.exitCode).toBe(0);
			// Status names are project config data, not UI chrome, so they stay as configured.
			expect(result.stdout.toString()).toContain("To Do:");
		});

		it("shows the English empty-list message by default", async () => {
			const result = await $`bun ${[CLI_PATH, "task", "list", "--plain"]}`.cwd(TEST_DIR).quiet();
			expect(result.exitCode).toBe(0);
			expect(result.stdout.toString()).toContain("No tasks found.");
		});
	});
});
