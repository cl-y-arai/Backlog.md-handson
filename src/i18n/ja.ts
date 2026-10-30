import type { Messages } from "./en.ts";
import { commonJa } from "./ja/common.ts";
import { boardJa } from "./ja/board.ts";
import { tasksJa } from "./ja/tasks.ts";
import { milestonesJa } from "./ja/milestones.ts";
import { docsJa } from "./ja/docs.ts";
import { settingsJa } from "./ja/settings.ts";
import { listJa } from "./ja/list.ts";
import { appJa } from "./ja/app.ts";

export const ja: Messages = {
	...commonJa,
	...boardJa,
	...tasksJa,
	...milestonesJa,
	...docsJa,
	...settingsJa,
	...listJa,
	...appJa,
};
