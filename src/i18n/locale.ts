import { DEFAULT_STATUSES } from "../constants/index.ts";

export const LOCALES = ["en", "ja", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

/**
 * `ja` selects Japanese and `ar` Arabic (any case, surrounding spaces ignored); anything else,
 * including no value, selects English.
 */
export function parseLocale(value: string | null | undefined): Locale {
	const normalized = value?.trim().toLowerCase();
	return LOCALES.find((locale) => locale === normalized) ?? "en";
}

/** Arabic is written right to left; the other locales left to right. */
export function localeDirection(locale: Locale): "ltr" | "rtl" {
	return locale === "ar" ? "rtl" : "ltr";
}

/** Replaces `{name}` placeholders with `params.name`; unknown placeholders are left as written. */
export function formatMessage(template: string, params: Record<string, string | number> = {}): string {
	return template.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
		name in params ? String(params[name]) : placeholder,
	);
}

/** The default status a stored status names exactly, if any. Custom statuses have no translation. */
export function findDefaultStatus(status: string): (typeof DEFAULT_STATUSES)[number] | undefined {
	return DEFAULT_STATUSES.find((candidate) => candidate === status);
}

/**
 * Pairs an area's English messages with their Japanese and Arabic translations. Each translation
 * must provide every English key, so a missing translation fails the type check.
 */
export function defineMessages<const E extends Record<string, string>>(
	en: E,
	ja: Record<keyof E, string>,
	ar: Record<keyof E, string>,
): Record<Locale, Record<keyof E, string>> & { en: E } {
	return { en, ja, ar };
}
