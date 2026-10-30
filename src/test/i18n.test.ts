import { describe, expect, it } from "bun:test";
import { format, LANGUAGES, MESSAGES, resolveLanguage } from "../i18n/index.ts";

const keyPaths = (value: unknown, prefix = ""): string[] =>
	typeof value === "object" && value !== null
		? Object.entries(value).flatMap(([key, child]) => keyPaths(child, `${prefix}${key}.`))
		: [prefix];

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();

const leaves = (value: unknown): string[] =>
	typeof value === "object" && value !== null ? Object.values(value).flatMap(leaves) : [String(value)];

describe("i18n", () => {
	it("defines every language with the same keys and placeholders as English", () => {
		const english = MESSAGES.en;
		for (const language of Object.keys(LANGUAGES) as (keyof typeof LANGUAGES)[]) {
			expect(keyPaths(MESSAGES[language])).toEqual(keyPaths(english));
			expect(leaves(MESSAGES[language]).map(placeholders)).toEqual(leaves(english).map(placeholders));
		}
	});

	it("prefers the saved language, then the browser language, then English", () => {
		expect(resolveLanguage("ja", ["en-US"])).toBe("ja");
		expect(resolveLanguage(null, ["fr-FR", "ja-JP"])).toBe("ja");
		expect(resolveLanguage("de", ["fr-FR"])).toBe("en");
	});

	it("fills placeholders and leaves unknown ones untouched", () => {
		expect(format("{a} and {b}", { a: 1 })).toBe("1 and {b}");
	});
});
