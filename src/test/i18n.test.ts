import { describe, expect, it } from "bun:test";
import { DEFAULT_LOCALE, isLocale, LOCALES, matchLocale, messages, translate } from "../i18n/index.ts";

describe("i18n", () => {
	it("defines every locale with the same keys as English", () => {
		const keys = Object.keys(messages[DEFAULT_LOCALE]).sort();
		for (const locale of LOCALES) {
			expect(Object.keys(messages[locale]).sort()).toEqual(keys);
		}
	});

	it("has no empty messages", () => {
		for (const locale of LOCALES) {
			for (const value of Object.values(messages[locale])) {
				expect(value.trim()).not.toBe("");
			}
		}
	});

	it("keeps interpolation placeholders consistent across locales", () => {
		const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort();
		for (const [key, en] of Object.entries(messages.en)) {
			for (const locale of LOCALES) {
				expect(placeholders(messages[locale][key as keyof typeof messages.en])).toEqual(placeholders(en));
			}
		}
	});

	it("translates and interpolates", () => {
		expect(translate("en", "side.settings")).toBe("Settings");
		expect(translate("ja", "side.settings")).toBe("設定");
		expect(translate("ja", "language.switchTo", { language: "English" })).toBe("言語をEnglishに切り替える");
		expect(translate("en", "language.switchTo", {})).toBe("Switch language to {language}");
	});

	it("matches supported locales from language tags", () => {
		expect(matchLocale("ja-JP")).toBe("ja");
		expect(matchLocale("EN-us")).toBe("en");
		expect(matchLocale("fr")).toBeUndefined();
		expect(matchLocale(undefined)).toBeUndefined();
		expect(isLocale("ja")).toBe(true);
		expect(isLocale("de")).toBe(false);
	});
});
