import { board } from "./catalog/board.ts";
import { common } from "./catalog/common.ts";
import { documents } from "./catalog/documents.ts";
import { init } from "./catalog/init.ts";
import { list } from "./catalog/list.ts";
import { milestones } from "./catalog/milestones.ts";
import { settings } from "./catalog/settings.ts";
import { shell } from "./catalog/shell.ts";
import { statistics } from "./catalog/statistics.ts";
import { task } from "./catalog/task.ts";
import { DEFAULT_LANGUAGE, LANGUAGES, type Language } from "./define-messages.ts";

export { DEFAULT_LANGUAGE, LANGUAGES, type Language };

/** Browser UI text, one namespace per area of the web app. */
export const catalog = { common, board, task, list, milestones, statistics, documents, settings, init, shell };

type Catalog = typeof catalog;

/** A translatable text, written as `namespace.key`, for example `common.cancel`. */
export type MessageKey = {
	[Namespace in keyof Catalog]: `${Namespace}.${Extract<keyof Catalog[Namespace]["en"], string>}`;
}[keyof Catalog];

export type MessageParams = Record<string, string | number>;

export type Translate = (key: MessageKey, params?: MessageParams) => string;

export function isLanguage(value: unknown): value is Language {
	return typeof value === "string" && (LANGUAGES as readonly string[]).includes(value);
}

/** Returns the text for `key` in `language`, replacing `{name}` placeholders with `params.name`. */
export function translate(language: Language, key: MessageKey, params?: MessageParams): string {
	const separator = key.indexOf(".");
	const namespace = catalog[key.slice(0, separator) as keyof Catalog] as Record<Language, Record<string, string>>;
	const text = namespace[language][key.slice(separator + 1)] ?? key;
	if (!params) return text;
	return text.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
		name in params ? String(params[name]) : placeholder,
	);
}
