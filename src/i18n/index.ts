import { DEFAULT_STATUSES } from "../constants/index.ts";
import { en, type MessageKey } from "./en.ts";
import { ja } from "./ja.ts";

export type Locale = "en" | "ja";
export type { MessageKey };

const MESSAGES: Record<Locale, Record<MessageKey, string>> = { en, ja };

/** Reads BACKLOG_LANG on every call; `ja` selects Japanese and anything else, including unset, selects English. */
export function resolveLocale(env: NodeJS.ProcessEnv = process.env): Locale {
	return env.BACKLOG_LANG?.trim().toLowerCase() === "ja" ? "ja" : "en";
}

/** Returns the message for the current locale, replacing `{name}` placeholders with `params.name`. */
export function t(key: MessageKey, params: Record<string, string> = {}): string {
	const template = MESSAGES[resolveLocale()][key];
	return template.replace(/\{(\w+)\}/g, (placeholder, name: string) => params[name] ?? placeholder);
}

/**
 * Display label for a status. Only the default statuses have translations; a custom status is the
 * user's own text and is shown unchanged. Stored values and filters keep the configured spelling.
 */
export function localizeStatus(status: string): string {
	const defaultStatus = DEFAULT_STATUSES.find((candidate) => candidate === status);
	return defaultStatus ? t(`status.${defaultStatus}`) : status;
}
