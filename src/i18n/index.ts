import { en, type Messages } from "./en.ts";
import { ja } from "./ja.ts";

export type { Messages };

export const LANGUAGES = {
	en: "English",
	ja: "日本語",
} as const;

export type Language = keyof typeof LANGUAGES;

export const DEFAULT_LANGUAGE: Language = "en";

export const MESSAGES: Record<Language, Messages> = { en, ja };

export function isLanguage(value: unknown): value is Language {
	return typeof value === "string" && Object.hasOwn(LANGUAGES, value);
}

/** Picks the language from a saved preference, then the browser locale, then the default. */
export function resolveLanguage(saved: string | null | undefined, browserLanguages: readonly string[] = []): Language {
	if (isLanguage(saved)) return saved;
	for (const tag of browserLanguages) {
		const base = tag.toLowerCase().split("-")[0];
		if (isLanguage(base)) return base;
	}
	return DEFAULT_LANGUAGE;
}

/** Replaces `{name}` placeholders with the matching value. */
export function format(template: string, values: Record<string, string | number>): string {
	return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}
