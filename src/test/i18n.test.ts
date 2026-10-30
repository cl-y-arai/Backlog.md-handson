import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { BACKLOG_LANG_ENV, resolveLocale, t } from "../i18n/index.ts";

describe("i18n", () => {
	const originalValue = process.env[BACKLOG_LANG_ENV];

	beforeEach(() => {
		delete process.env[BACKLOG_LANG_ENV];
	});

	afterEach(() => {
		if (originalValue === undefined) {
			delete process.env[BACKLOG_LANG_ENV];
		} else {
			process.env[BACKLOG_LANG_ENV] = originalValue;
		}
	});

	it("defaults to English when BACKLOG_LANG is unset", () => {
		expect(resolveLocale()).toBe("en");
		expect(t("cli.rootDescription")).toBe("Backlog.md - Project management CLI");
	});

	it("resolves to Japanese when BACKLOG_LANG=ja", () => {
		process.env[BACKLOG_LANG_ENV] = "ja";
		expect(resolveLocale()).toBe("ja");
		expect(t("cli.rootDescription")).toBe("Backlog.md - プロジェクト管理 CLI");
	});

	it("is case-insensitive and tolerates surrounding whitespace", () => {
		process.env[BACKLOG_LANG_ENV] = "  JA  ";
		expect(resolveLocale()).toBe("ja");
	});

	it("falls back to English for unsupported locale values", () => {
		process.env[BACKLOG_LANG_ENV] = "fr";
		expect(resolveLocale()).toBe("en");
	});

	it("interpolates params into the template", () => {
		process.env[BACKLOG_LANG_ENV] = "en";
		expect(t("taskList.noChildTasksFound", { parentId: "TASK-5" })).toBe(
			"No child tasks found for parent task TASK-5.",
		);
		process.env[BACKLOG_LANG_ENV] = "ja";
		expect(t("taskList.noChildTasksFound", { parentId: "TASK-5" })).toBe(
			"親タスク TASK-5 の子タスクが見つかりません。",
		);
	});
});
