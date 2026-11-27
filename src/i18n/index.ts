import { en, type MessageKey } from "./en.ts";
import { ja } from "./ja.ts";

/** Environment variable that selects the CLI display language. */
export const BACKLOG_LANG_ENV = "BACKLOG_LANG";

export type Language = "en" | "ja";

const messages: Record<Language, Record<MessageKey, string>> = { en, ja };

/**
 * BACKLOG_LANG から表示言語を決める。未設定・未対応の値は既定の英語にする。
 * 大文字小文字と前後の空白は無視する（例: " JA " → ja）。
 */
export function resolveLanguage(env: NodeJS.ProcessEnv = process.env): Language {
	const value = env[BACKLOG_LANG_ENV]?.trim().toLowerCase();
	return value === "ja" ? "ja" : "en";
}

/** 現在の表示言語でメッセージを返す。言語は呼び出しごとに環境変数から読む。 */
export function t(key: MessageKey, language: Language = resolveLanguage()): string {
	return messages[language][key];
}

/**
 * ステータスの表示名を返す。翻訳するのは既定ステータス（To Do / In Progress / Done）だけで、
 * ユーザーが config で定義した独自ステータスはそのまま表示する。
 * 保存値やフィルタ値ではなく、表示専用に使うこと。
 */
export function translateStatus(status: string, language: Language = resolveLanguage()): string {
	const key = `status.${status}`;
	return Object.hasOwn(en, key) ? t(key as MessageKey, language) : status;
}
