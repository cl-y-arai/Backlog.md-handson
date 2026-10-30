import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdir } from "node:fs/promises";
import { $ } from "bun";
import { FileSystem } from "../file-system/operations.ts";
import { BACKLOG_LANG_ENV } from "../i18n/index.ts";
import { BacklogServer } from "../server/index.ts";
import { createUniqueTestDir, safeCleanup } from "./test-utils.ts";

type LocaleServerHandlers = {
	handleGetLocale(): Response;
};

describe("BacklogServer locale endpoint", () => {
	let testDir: string;
	let server: BacklogServer | null;
	let handlers: LocaleServerHandlers;
	let originalLang: string | undefined;

	beforeEach(async () => {
		testDir = createUniqueTestDir("server-locale");
		await mkdir(testDir, { recursive: true });
		await $`git init -b main`.cwd(testDir).quiet();
		const filesystem = new FileSystem(testDir);
		await filesystem.ensureBacklogStructure();
		await filesystem.saveConfig({
			projectName: "Server locale",
			statuses: ["To Do", "In Progress", "Done"],
			labels: [],
			milestones: [],
			dateFormat: "YYYY-MM-DD",
			remoteOperations: false,
			checkActiveBranches: false,
			autoCommit: false,
		});
		server = new BacklogServer(testDir);
		handlers = server as unknown as LocaleServerHandlers;
		originalLang = process.env[BACKLOG_LANG_ENV];
	});

	afterEach(async () => {
		if (originalLang === undefined) {
			delete process.env[BACKLOG_LANG_ENV];
		} else {
			process.env[BACKLOG_LANG_ENV] = originalLang;
		}
		await server?.stop();
		server = null;
		await safeCleanup(testDir);
	});

	it("reports English by default", async () => {
		delete process.env[BACKLOG_LANG_ENV];
		const response = handlers.handleGetLocale();
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ locale: "en" });
	});

	it("reports Japanese when BACKLOG_LANG=ja", async () => {
		process.env[BACKLOG_LANG_ENV] = "ja";
		const response = handlers.handleGetLocale();
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ locale: "ja" });
	});
});
