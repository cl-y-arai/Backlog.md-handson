import { commonEn } from "./en/common.ts";
import { boardEn } from "./en/board.ts";
import { tasksEn } from "./en/tasks.ts";
import { milestonesEn } from "./en/milestones.ts";
import { docsEn } from "./en/docs.ts";
import { settingsEn } from "./en/settings.ts";
import { listEn } from "./en/list.ts";
import { appEn } from "./en/app.ts";

export const en = {
	...commonEn,
	...boardEn,
	...tasksEn,
	...milestonesEn,
	...docsEn,
	...settingsEn,
	...listEn,
	...appEn,
} as const;

export type MessageKey = keyof typeof en;
export type Messages = Record<MessageKey, string>;
