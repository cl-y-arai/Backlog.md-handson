import { en, type MessageKey, type Messages } from "./en.ts";
import { ja } from "./ja.ts";

export type { MessageKey, Messages };

export const LOCALES = ["en", "ja"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_NAMES: Record<Locale, string> = {
	en: "English",
	ja: "日本語",
};

export const messages: Record<Locale, Messages> = { en, ja };

export function isLocale(value: unknown): value is Locale {
	return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Pick a supported locale from a BCP 47 language tag such as "ja-JP". */
export function matchLocale(tag: string | null | undefined): Locale | undefined {
	const primary = tag?.toLowerCase().split("-")[0];
	return isLocale(primary) ? primary : undefined;
}

export function translate(locale: Locale, key: MessageKey, params?: Record<string, string | number>): string {
	const template = messages[locale][key] ?? messages[DEFAULT_LOCALE][key];
	if (!params) return template;
	return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match));
}
