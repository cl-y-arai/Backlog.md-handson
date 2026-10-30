import type { Messages } from "../en/index.ts";
import { app } from "./app.ts";
import { board } from "./board.ts";
import { common } from "./common.ts";
import { decisions } from "./decisions.ts";
import { documents } from "./documents.ts";
import { drafts } from "./drafts.ts";
import { initialization } from "./initialization.ts";
import { milestones } from "./milestones.ts";
import { navigation } from "./navigation.ts";
import { settings } from "./settings.ts";
import { sideNavigation } from "./sideNavigation.ts";
import { statistics } from "./statistics.ts";
import { system } from "./system.ts";
import { taskDetails } from "./taskDetails.ts";
import { taskList } from "./taskList.ts";

export const ja: Messages = {
	common,
	navigation,
	app,
	board,
	taskDetails,
	taskList,
	drafts,
	milestones,
	sideNavigation,
	documents,
	decisions,
	statistics,
	initialization,
	settings,
	system,
};
