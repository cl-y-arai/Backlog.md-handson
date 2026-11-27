import { box } from "neo-neo-bblessed";
import type { TaskStatistics } from "../core/statistics.ts";
import { t, translateStatus } from "../i18n/index.ts";
import { formatPriorityLabel } from "../utils/priority-config.ts";
import { getStatusIcon } from "./status-icon.ts";
import { createScreen, formatTuiTitle } from "./tui.ts";

const priorityColors: Record<string, string> = {
	high: "red",
	medium: "yellow",
	low: "green",
	none: "gray",
};

function getPriorityBreakdownRows(statistics: TaskStatistics): Array<{ label: string; count: number; color: string }> {
	const rows = Array.from(statistics.priorityCounts)
		.filter(([, count]) => count > 0)
		.map(([priority, count]) => ({
			label: formatPriorityLabel(priority),
			count,
			color: priorityColors[priority] ?? "white",
		}));
	if (statistics.noPriorityCount > 0) {
		rows.push({ label: t("overview.noPriority"), count: statistics.noPriorityCount, color: "gray" });
	}
	return rows;
}

/**
 * Render the project overview in an interactive TUI
 */
export async function renderOverviewTui(statistics: TaskStatistics, projectName: string): Promise<void> {
	// If not in TTY, fall back to plain text output
	if (!process.stdout.isTTY) {
		renderPlainTextOverview(statistics, projectName);
		return;
	}

	return new Promise<void>((resolve) => {
		const screen = createScreen({ title: formatTuiTitle(t("title.overview"), projectName) });

		// Main container
		const container = box({
			parent: screen,
			width: "100%",
			height: "100%",
		});

		// Title
		box({
			parent: container,
			top: 0,
			left: "center",
			width: "shrink",
			height: 3,
			content: `{center}{bold}${t("overview.heading", { project: projectName })}{/bold}{/center}`,
			tags: true,
			style: {},
		});

		// Status Overview Section (Top Left)
		const statusBox = box({
			parent: container,
			top: 3,
			left: 0,
			width: "50%",
			height: "40%",
			border: { type: "line" },
			label: ` ${t("overview.statusOverview")} `,
			style: {
				border: { fg: "gray" },
			},
			tags: true,
			scrollable: true,
			alwaysScroll: true,
			keys: true,
			vi: true,
			mouse: true,
		});

		let statusContent = "";
		for (const [status, count] of statistics.statusCounts) {
			const icon = getStatusIcon(status);
			const percentage = statistics.totalTasks > 0 ? Math.round((count / statistics.totalTasks) * 100) : 0;
			statusContent += `  ${icon} {bold}${translateStatus(status)}:{/bold} ${t("overview.taskCount", { count, percent: percentage })}\n`;
		}
		statusContent += `\n  {cyan-fg}${t("overview.totalTasks")}{/cyan-fg} ${statistics.totalTasks}\n`;
		statusContent += `  {green-fg}${t("overview.completion")}{/green-fg} ${statistics.completionPercentage}%\n`;
		if (statistics.draftCount > 0) {
			statusContent += `  {yellow-fg}${t("overview.drafts")}{/yellow-fg} ${statistics.draftCount}\n`;
		}
		statusBox.setContent(statusContent);

		// Priority Breakdown Section (Top Right)
		const priorityBox = box({
			parent: container,
			top: 3,
			left: "50%",
			width: "50%",
			height: "40%",
			border: { type: "line" },
			label: ` ${t("overview.priorityBreakdown")} `,
			style: {
				border: { fg: "gray" },
			},
			tags: true,
			scrollable: true,
			alwaysScroll: true,
			keys: true,
			vi: true,
			mouse: true,
		});

		let priorityContent = "";
		for (const { label, count, color } of getPriorityBreakdownRows(statistics)) {
			const percentage = statistics.totalTasks > 0 ? Math.round((count / statistics.totalTasks) * 100) : 0;
			priorityContent += `  {${color}-fg}${label}:{/${color}-fg} ${t("overview.taskCount", { count, percent: percentage })}\n`;
		}
		priorityBox.setContent(priorityContent);

		// Recent Activity Section (Bottom Left)
		const activityBox = box({
			parent: container,
			top: "43%",
			left: 0,
			width: "50%",
			height: "28%",
			border: { type: "line" },
			label: ` ${t("overview.recentActivity")} `,
			style: {
				border: { fg: "gray" },
			},
			tags: true,
			scrollable: true,
			alwaysScroll: true,
			keys: true,
			vi: true,
			mouse: true,
		});

		let activityContent = `{bold}${t("overview.recentlyCreated")}{/bold}\n`;
		if (statistics.recentActivity.created.length > 0) {
			for (const task of statistics.recentActivity.created) {
				activityContent += `  ${task.id} - ${task.title.substring(0, 40)}${task.title.length > 40 ? "..." : ""}\n`;
			}
		} else {
			activityContent += `  {gray-fg}${t("overview.noneCreated")}{/gray-fg}\n`;
		}

		activityContent += `\n{bold}${t("overview.recentlyUpdated")}{/bold}\n`;
		if (statistics.recentActivity.updated.length > 0) {
			for (const task of statistics.recentActivity.updated) {
				activityContent += `  ${task.id} - ${task.title.substring(0, 40)}${task.title.length > 40 ? "..." : ""}\n`;
			}
		} else {
			activityContent += `  {gray-fg}${t("overview.noneUpdated")}{/gray-fg}\n`;
		}
		activityBox.setContent(activityContent);

		// Project Health Section (Bottom Right)
		const healthBox = box({
			parent: container,
			top: "43%",
			left: "50%",
			width: "50%",
			height: "28%",
			border: { type: "line" },
			label: ` ${t("overview.projectHealth")} `,
			style: {
				border: { fg: "gray" },
			},
			tags: true,
			scrollable: true,
			alwaysScroll: true,
			keys: true,
			vi: true,
			mouse: true,
		});

		let healthContent = `{bold}${t("overview.averageAge")}{/bold} ${t("overview.days", { count: statistics.projectHealth.averageTaskAge })}\n\n`;

		healthContent += `{bold}${t("overview.staleTasks")}{/bold} {gray-fg}${t("overview.staleHint")}{/gray-fg}\n`;
		if (statistics.projectHealth.staleTasks.length > 0) {
			for (const task of statistics.projectHealth.staleTasks) {
				healthContent += `  {yellow-fg}${task.id}{/yellow-fg} - ${task.title.substring(0, 35)}${task.title.length > 35 ? "..." : ""}\n`;
			}
		} else {
			healthContent += `  {green-fg}${t("overview.noStale")}{/green-fg}\n`;
		}

		healthContent += `\n{bold}${t("overview.blockedTasks")}{/bold} {gray-fg}${t("overview.blockedHint")}{/gray-fg}\n`;
		if (statistics.projectHealth.blockedTasks.length > 0) {
			for (const task of statistics.projectHealth.blockedTasks) {
				healthContent += `  {red-fg}${task.id}{/red-fg} - ${task.title.substring(0, 35)}${task.title.length > 35 ? "..." : ""}\n`;
			}
		} else {
			healthContent += `  {green-fg}${t("overview.noBlocked")}{/green-fg}\n`;
		}
		healthBox.setContent(healthContent);

		// Instructions at bottom
		box({
			parent: container,
			bottom: 0,
			left: 0,
			width: "100%",
			height: 3,
			content: `{center}${t("overview.exitHint")}{/center}`,
			tags: true,
			style: {
				fg: "gray",
			},
		});

		// Focus on status box for scrolling
		statusBox.focus();

		// Exit handlers
		screen.key(["escape", "q", "C-c"], () => {
			screen.destroy();
			resolve();
		});

		screen.render();
	});
}

/**
 * Render plain text overview for non-TTY environments
 */
function renderPlainTextOverview(statistics: TaskStatistics, projectName: string): void {
	console.log(`\n${t("overview.heading", { project: projectName })}\n${"=".repeat(40)}\n`);

	console.log(`${t("overview.statusOverview")}:`);
	for (const [status, count] of statistics.statusCounts) {
		const percentage = statistics.totalTasks > 0 ? Math.round((count / statistics.totalTasks) * 100) : 0;
		console.log(`  ${translateStatus(status)}: ${t("overview.taskCount", { count, percent: percentage })}`);
	}
	console.log(`\n  ${t("overview.totalTasks")} ${statistics.totalTasks}`);
	console.log(`  ${t("overview.completion")} ${statistics.completionPercentage}%`);
	if (statistics.draftCount > 0) {
		console.log(`  ${t("overview.drafts")} ${statistics.draftCount}`);
	}

	console.log(`\n${t("overview.priorityBreakdown")}:`);
	for (const { label, count } of getPriorityBreakdownRows(statistics)) {
		const percentage = statistics.totalTasks > 0 ? Math.round((count / statistics.totalTasks) * 100) : 0;
		console.log(`  ${label}: ${t("overview.taskCount", { count, percent: percentage })}`);
	}

	console.log(`\n${t("overview.recentActivity")}:`);
	console.log(`  ${t("overview.recentlyCreated")}`);
	if (statistics.recentActivity.created.length > 0) {
		for (const task of statistics.recentActivity.created) {
			console.log(`    ${task.id} - ${task.title}`);
		}
	} else {
		console.log(`    ${t("overview.noneCreated")}`);
	}

	console.log(`\n  ${t("overview.recentlyUpdated")}`);
	if (statistics.recentActivity.updated.length > 0) {
		for (const task of statistics.recentActivity.updated) {
			console.log(`    ${task.id} - ${task.title}`);
		}
	} else {
		console.log(`    ${t("overview.noneUpdated")}`);
	}

	console.log(`\n${t("overview.projectHealth")}:`);
	console.log(
		`  ${t("overview.averageAge")} ${t("overview.days", { count: statistics.projectHealth.averageTaskAge })}`,
	);

	console.log(`\n  ${t("overview.staleTasksPlain")}`);
	if (statistics.projectHealth.staleTasks.length > 0) {
		for (const task of statistics.projectHealth.staleTasks) {
			console.log(`    ${task.id} - ${task.title}`);
		}
	} else {
		console.log(`    ${t("overview.noStale")}`);
	}

	console.log(`\n  ${t("overview.blockedTasksPlain")}`);
	if (statistics.projectHealth.blockedTasks.length > 0) {
		for (const task of statistics.projectHealth.blockedTasks) {
			console.log(`    ${task.id} - ${task.title}`);
		}
	} else {
		console.log(`    ${t("overview.noBlocked")}`);
	}
	console.log("");
}
