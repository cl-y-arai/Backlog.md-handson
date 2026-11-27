import { ar } from "./ar.ts";
import { en, type MessageKey } from "./en.ts";
import { ja } from "./ja.ts";
import { findDefaultStatus, formatMessage, type Locale, parseLocale } from "./locale.ts";

export type { Locale, MessageKey };

const MESSAGES: Record<Locale, Record<MessageKey, string>> = { en, ja, ar };

/** Reads BACKLOG_LANG on every call; `ja` selects Japanese, `ar` Arabic, and anything else, including unset, English. */
export function resolveLocale(env: NodeJS.ProcessEnv = process.env): Locale {
	return parseLocale(env.BACKLOG_LANG);
}

/** Returns the CLI message for the current locale, replacing `{name}` placeholders with `params.name`. */
export function t(key: MessageKey, params: Record<string, string> = {}): string {
	return formatMessage(MESSAGES[resolveLocale()][key], params);
}

/**
 * Display label for a status. Only the default statuses have translations; a custom status is the
 * user's own text and is shown unchanged. Stored values and filters keep the configured spelling.
 */
export function localizeStatus(status: string): string {
	const defaultStatus = findDefaultStatus(status);
	return defaultStatus ? t(`status.${defaultStatus}`) : status;
}
