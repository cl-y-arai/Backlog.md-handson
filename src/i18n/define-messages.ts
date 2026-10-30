export const LANGUAGES = ["en", "ja"] as const;

export type Language = (typeof LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = "en";

export type Messages = Record<string, string>;

/**
 * Declares one namespace of browser UI text. English is the source text; every
 * other language must translate exactly the same keys, so a missing or extra
 * translation is a type error.
 */
export function defineMessages<T extends Messages>(
	messages: { en: T } & Record<Exclude<Language, "en">, Record<keyof T, string>>,
) {
	return messages;
}
