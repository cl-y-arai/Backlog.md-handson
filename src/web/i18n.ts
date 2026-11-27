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

// A language the viewer picked in the header overrides the server's BACKLOG_LANG in this browser.
const SAVED_LOCALE_KEY = "backlog-locale";

export function getSavedLocale(): Locale | null {
	try {
		const saved = window.localStorage.getItem(SAVED_LOCALE_KEY);
		return saved ? parseLocale(saved) : null;
	} catch {
		return null;
	}
}

/** Saves the viewer's choice and reloads, so every label is rendered again in that language. */
export function switchLocale(next: Locale): void {
	try {
		window.localStorage.setItem(SAVED_LOCALE_KEY, next);
	} catch {
		// Without storage the choice lasts only until the next reload.
	}
	setLocale(next);
	window.location.reload();
}

/** Browser UI message for the current locale, replacing `{name}` placeholders with `params.name`. */
export function t(key: WebMessageKey, params?: Record<string, string | number>): string {
	return formatMessage(webMessages[currentLocale][key], params);
}

/** Display label for a status; custom statuses are shown as written. Never use it for stored values. */
export function statusLabel(status: string): string {
	if (status === "Draft") return t("common.status.Draft");
	const defaultStatus = findDefaultStatus(status);
	return defaultStatus ? t(`common.status.${defaultStatus}` as WebMessageKey) : status;
}

/**
 * Progress messages arrive from the shared server core in English. The browser shows the known
 * ones in Japanese; an unknown message is shown as sent.
 */
const SERVER_MESSAGE_TRANSLATIONS: Array<[RegExp, (m: RegExpMatchArray) => string]> = [
	[/^Loading drafts\.\.\.$/, () => "下書きを読み込み中..."],
	[/^Applying latest task states from branch scans\.\.\.$/, () => "ブランチの走査結果から最新のタスク状態を反映中..."],
	[/^Indexing (\d+) recent remote branches\.\.\.$/, (m) => `最近のリモートブランチ ${m[1]} 件をインデックス中...`],
	[/^Indexing (\d+) other local branches\.\.\.$/, (m) => `ほかのローカルブランチ ${m[1]} 件をインデックス中...`],
	[
		/^Checking (\d+) tasks across (\d+) branches with backlog \(from (\d+) days, (\d+) local, (\d+) remote\)\.\.\.$/,
		(m) => `${m[2]} 件のブランチ（過去 ${m[3]} 日、ローカル ${m[4]}・リモート ${m[5]}）でタスク ${m[1]} 件を確認中...`,
	],
	[
		/^Checking (\d+) tasks across (\d+) branches with backlog \((\d+) local, (\d+) remote\)\.\.\.$/,
		(m) => `${m[2]} 件のブランチ（ローカル ${m[3]}・リモート ${m[4]}）でタスク ${m[1]} 件を確認中...`,
	],
	[/^Found all (\d+) tasks in priority branches$/, (m) => `優先ブランチでタスク ${m[1]} 件をすべて検出しました`],
	[/^Checked (\d+) tasks$/, (m) => `タスク ${m[1]} 件を確認しました`],
	[
		/^Checking (\d+) remaining tasks across (\d+) branches\.\.\.$/,
		(m) => `残りのタスク ${m[1]} 件を ${m[2]} 件のブランチで確認中...`,
	],
];

export function localizeServerMessage(message: string): string {
	if (currentLocale !== "ja") return message;
	for (const [pattern, translate] of SERVER_MESSAGE_TRANSLATIONS) {
		const match = message.match(pattern);
		if (match) return translate(match);
	}
	return message;
}
