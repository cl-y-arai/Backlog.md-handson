import { DEFAULT_STATUSES } from "../constants/index.ts";

export type Locale = "en" | "ja";

/** `ja` (any case, surrounding spaces ignored) selects Japanese; anything else, including no value, selects English. */
export function parseLocale(value: string | null | undefined): Locale {
	return value?.trim().toLowerCase() === "ja" ? "ja" : "en";
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
 * Pairs an area's English messages with their Japanese translations. The Japanese table must
 * provide every English key, so a missing translation fails the type check.
 */
export function defineMessages<const E extends Record<string, string>>(
	en: E,
	ja: Record<keyof E, string>,
): { en: E; ja: Record<keyof E, string> } {
	return { en, ja };
}
