import { en } from "./en.ts";
import { ja } from "./ja.ts";
import type { Messages } from "./messages.ts";

export const BACKLOG_LANG_ENV = "BACKLOG_LANG";

export type Locale = "en" | "ja";

const catalogs: Record<Locale, Messages> = { en, ja };

export function resolveLocale(): Locale {
	const raw = process.env[BACKLOG_LANG_ENV]?.trim().toLowerCase();
	return raw === "ja" ? "ja" : "en";
}

export function t(key: keyof Messages, params?: Record<string, string>): string {
	const template = catalogs[resolveLocale()][key];
	if (!params) {
		return template;
	}
	return Object.entries(params).reduce(
		(text, [name, value]) => text.replaceAll(`{${name}}`, value),
		template,
	);
}
