import type { Locale } from "../locale.ts";
import { boardMessages } from "./board.ts";
import { commonMessages } from "./common.ts";
import { docsMessages } from "./docs.ts";
import { listsMessages } from "./lists.ts";
import { shellMessages } from "./shell.ts";
import { taskMessages } from "./task.ts";

/** Each area prefixes its keys (common., shell., board., task., lists., docs.) so merged tables never collide. */
const AREAS = [commonMessages, shellMessages, boardMessages, taskMessages, listsMessages, docsMessages] as const;

type AreaKeys<T> = T extends { en: infer E } ? keyof E : never;
export type WebMessageKey = AreaKeys<(typeof AREAS)[number]> & string;

export const webMessages: Record<Locale, Record<WebMessageKey, string>> = {
	en: Object.assign({}, ...AREAS.map((area) => area.en)),
	ja: Object.assign({}, ...AREAS.map((area) => area.ja)),
	ar: Object.assign({}, ...AREAS.map((area) => area.ar)),
};
