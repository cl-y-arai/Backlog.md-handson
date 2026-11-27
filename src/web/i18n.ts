import { findDefaultStatus, formatMessage, type Locale, parseLocale } from "../i18n/locale.ts";
import { type WebMessageKey, webMessages } from "../i18n/web/index.ts";

// The server's BACKLOG_LANG decides the language once at startup (see main.tsx); it does not change
// while the page is open, so components read it directly instead of through React context.
let currentLocale: Locale = "en";

export function setLocale(value: string | null | undefined): void {
	currentLocale = parseLocale(value);
}

export function getLocale(): Locale {
	return currentLocale;
}

/** Browser UI message for the current locale, replacing `{name}` placeholders with `params.name`. */
export function t(key: WebMessageKey, params?: Record<string, string | number>): string {
	return formatMessage(webMessages[currentLocale][key], params);
}

/** Display label for a status; custom statuses are shown as written. Never use it for stored values. */
export function statusLabel(status: string): string {
	const defaultStatus = findDefaultStatus(status);
	return defaultStatus ? t(`common.status.${defaultStatus}` as WebMessageKey) : status;
}
