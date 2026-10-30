import { describe, expect, it } from "bun:test";
import { catalog, isLanguage, LANGUAGES, translate } from "../i18n/index.ts";

function placeholders(text: string): string[] {
	return [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1] ?? "").sort();
}

describe("browser i18n catalog", () => {
	for (const [namespace, messages] of Object.entries(catalog)) {
		const english = messages.en as Record<string, string>;

		for (const language of LANGUAGES) {
			it(`${namespace}: ${language} translates every English key with the same placeholders`, () => {
				const translated = messages[language] as Record<string, string>;
				expect(Object.keys(translated).sort()).toEqual(Object.keys(english).sort());
				for (const [key, text] of Object.entries(english)) {
					expect(translated[key]?.trim()).not.toBe("");
					expect({ key, placeholders: placeholders(translated[key] ?? "") }).toEqual({
						key,
						placeholders: placeholders(text),
					});
				}
			});
		}
	}
});

describe("translate", () => {
	it("returns the text for the selected language", () => {
		expect(translate("en", "common.cancel")).toBe("Cancel");
		expect(translate("ja", "common.cancel")).toBe("キャンセル");
	});

	it("fills placeholders in the selected language", () => {
		expect(translate("en", "board.moveFailures", { failed: 2, total: 5 })).toBe("Could not move 2 of 5 tasks.");
		expect(translate("ja", "board.moveFailures", { failed: 2, total: 5 })).toBe(
			"5 件中 2 件のタスクを移動できませんでした。",
		);
	});

	it("leaves a placeholder visible when its value is missing", () => {
		expect(translate("en", "board.moveFailures", { failed: 2 })).toBe("Could not move 2 of {total} tasks.");
	});
});

describe("isLanguage", () => {
	it("accepts only supported languages", () => {
		expect(isLanguage("ja")).toBe(true);
		expect(isLanguage("en")).toBe(true);
		expect(isLanguage("fr")).toBe(false);
		expect(isLanguage(null)).toBe(false);
	});
});
