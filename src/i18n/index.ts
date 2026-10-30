import { en, type Messages } from "./en/index.ts";
import { ja } from "./ja/index.ts";

export type { Messages };

export type Language = "en" | "ja";

export const DEFAULT_LANGUAGE: Language = "en";

/** Selectable browser languages, each labelled in its own language. */
export const LANGUAGES: { code: Language; label: string }[] = [
	{ code: "en", label: "English" },
	{ code: "ja", label: "日本語" },
];

export const MESSAGES: Record<Language, Messages> = { en, ja };

export function isLanguage(value: unknown): value is Language {
	return LANGUAGES.some((language) => language.code === value);
}
