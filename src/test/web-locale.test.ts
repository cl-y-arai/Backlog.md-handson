import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Core } from "../core/backlog.ts";
import { BacklogServer } from "../server/index.ts";
import { getLocale, setLocale, statusLabel, t } from "../web/i18n.ts";
import { initializeTestProject } from "./test-utils.ts";

describe("browser UI language", () => {
	afterEach(() => {
		setLocale("en");
	});

	it("uses English until the server reports Japanese", () => {
		expect(getLocale()).toBe("en");
		expect(t("common.document.title")).toBe("Backlog.md - Task Management");
		expect(statusLabel("In Progress")).toBe("In Progress");

		setLocale("ja");
		expect(t("common.document.title")).toBe("Backlog.md - タスク管理");
		expect(statusLabel("In Progress")).toBe("進行中");
		expect(statusLabel("Review")).toBe("Review");
	});

	it("falls back to English for unsupported or missing values", () => {
		setLocale("fr");
		expect(getLocale()).toBe("en");
		setLocale(undefined);
		expect(getLocale()).toBe("en");
	});
});

describe("GET /api/locale", () => {
	let directory: string;
	let server: BacklogServer | undefined;
	const previousLang = process.env.BACKLOG_LANG;

	beforeEach(async () => {
		directory = await mkdtemp(join(tmpdir(), "backlog-web-locale-"));
		await initializeTestProject(new Core(directory), "Locale");
		server = new BacklogServer(directory);
		await server.start(0, false);
	});

	afterEach(async () => {
		await server?.stop();
		server = undefined;
		if (previousLang === undefined) delete process.env.BACKLOG_LANG;
		else process.env.BACKLOG_LANG = previousLang;
		await rm(directory, { recursive: true, force: true });
	});

	async function fetchLocale(): Promise<unknown> {
		const response = await fetch(`http://127.0.0.1:${server?.getPort()}/api/locale`);
		expect(response.status).toBe(200);
		return await response.json();
	}

	it("reports the language selected by BACKLOG_LANG", async () => {
		delete process.env.BACKLOG_LANG;
		expect(await fetchLocale()).toEqual({ locale: "en" });
		process.env.BACKLOG_LANG = "ja";
		expect(await fetchLocale()).toEqual({ locale: "ja" });
	});
});
