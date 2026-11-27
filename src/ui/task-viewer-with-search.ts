/* Task viewer with search/filter header UI */

import { stdout as output } from "node:process";
import type { BoxInterface, LineInterface, ScreenInterface, ScrollableTextInterface } from "neo-neo-bblessed";
import { box, line, scrollabletext } from "neo-neo-bblessed";
import { type Core, createRuntimeCore } from "../core/backlog.ts";
import {
	loadTaskDetail,
	type TaskCorpus,
	type TaskDetail,
	taskDependencyGraph,
	taskReadiness,
	toTaskDetail,
	withReadiness,
} from "../core/task-detail.ts";
import { formatDependencyGraphLines, formatDependencyNodeTuiLabel } from "../formatters/dependency-graph-text.ts";
import {
	buildAcceptanceCriteriaItems,
	buildDefinitionOfDoneItems,
	formatDateForDisplay,
	formatTaskPlainText,
} from "../formatters/task-plain-text.ts";
import { t, translateStatus } from "../i18n/index.ts";
import type { LabelMatchMode, Milestone, Task } from "../types/index.ts";
import { copyToClipboard } from "../utils/clipboard.ts";
import { areLabelSelectionsEqual, collectAvailableLabels } from "../utils/label-filter.ts";
import {
	createMilestoneFilterValueResolver,
	type MilestoneFilterValueResolver,
	NO_MILESTONE_FILTER_VALUE,
} from "../utils/milestone-filter.ts";
import { hasAnyPrefix } from "../utils/prefix-config.ts";
import { formatPriorityLabel, getPriorityOptions, normalizePriorityValue } from "../utils/priority-config.ts";
import { getProjectValues, resolveProjectValues } from "../utils/project-config.ts";
import { formatReadinessBlockers } from "../utils/readiness.ts";
import { canonicalTaskId, taskIdsEqual } from "../utils/task-id.ts";
import { applyTaskFilters, createTaskSearchIndex } from "../utils/task-search.ts";
import { sectionTasks, sortTasks } from "../utils/task-sorting.ts";
import { attachSubtaskSummaries } from "../utils/task-subtasks.ts";
import { getTaskTypeValues, resolveTaskTypeValues } from "../utils/task-type-config.ts";
import { formatChecklistItem } from "./checklist.ts";
import { transformCodePaths } from "./code-path.ts";
import { openConfirmPopup } from "./components/confirm-popup.ts";
import {
	createFilterHeader,
	type FilterControlId,
	type FilterHeader,
	type FilterState,
} from "./components/filter-header.ts";
import { openMultiSelectFilterPopup, openSingleSelectFilterPopup } from "./components/filter-popup.ts";
import { type BoundaryNavigationKey, createGenericList, type GenericList } from "./components/generic-list.ts";
import { openHelpPopup } from "./components/help-popup.ts";
import {
	footerLine,
	formatFooterContent,
	getFilterFooterContent,
	getTaskListFooterContent,
	keyHint,
} from "./footer-content.ts";
import { formatHeading } from "./heading.ts";
import { createLoadingScreen } from "./loading.ts";
import { formatPriorityMarker } from "./priority-marker.ts";
import { formatProjectBadge } from "./project.ts";
import { formatStatusWithIcon, getStatusColor, wrapStatusColor } from "./status-icon.ts";
import { archiveTaskFromTui, formatArchiveNotice, formatReadOnlyNotice } from "./task-lifecycle.ts";
import { createTaskRowPrefix, type TaskRowPrefix } from "./task-row-prefix.ts";
import { formatTaskTypeBadge } from "./task-type.ts";
import { addScrollKeys, createScreen, formatTuiTitle } from "./tui.ts";

export function formatTaskViewerListItem(
	task: Task,
	dateFormat?: string,
	configuredProjects?: string[],
	configuredPriorities?: readonly string[],
	// The list mixes statuses and nothing else names them, so the prefix carries the status
	// label. Rendering a lone row aligns it against itself.
	formatPrefix: TaskRowPrefix = createTaskRowPrefix([task], { showStatus: true }),
): string {
	const assigneeText = task.assignee?.length
		? ` {cyan-fg}${task.assignee[0]?.startsWith("@") ? task.assignee[0] : `@${task.assignee[0]}`}{/}`
		: "";
	const labelsText = task.labels?.length ? ` {yellow-fg}[${task.labels.join(", ")}]{/}` : "";
	const typeBadge = formatTaskTypeBadge(task.type);
	const typeText = typeBadge ? ` ${typeBadge}` : "";
	const projectBadge = formatProjectBadge(task.project, configuredProjects);
	const projectText = projectBadge ? ` ${projectBadge}` : "";
	// The priority marker takes the place of the dash between ID and title, so it adds no columns
	// and cannot push the title out of a narrow list.
	const titleSeparator = formatPriorityMarker(task.priority, configuredPriorities) || "-";
	const dueDateText = task.dueDate
		? ` {gray-fg}${t("tui.due", { date: formatDateForDisplay(task.dueDate, { dateFormat }) })}{/}`
		: "";
	const isCrossBranch = Boolean((task as Task & { branch?: string }).branch);
	const branchText = isCrossBranch ? ` {green-fg}(${(task as Task & { branch?: string }).branch}){/}` : "";

	// The prefix keeps its own color tags, whose {/} would close the cross-branch dim, so the
	// dim starts at the task id.
	const prefix = formatPrefix(task);
	const content = `{bold}${task.id}{/bold}${typeText}${projectText}${dueDateText} ${titleSeparator} ${task.title}${assigneeText}${labelsText}${branchText}`;
	return `${prefix}${isCrossBranch ? `{gray-fg}${content}{/}` : content}`;
}

export function buildTaskViewerMilestoneFilterModel(
	activeMilestones: Milestone[],
	archivedMilestones: Milestone[] = [],
): {
	availableMilestoneTitles: string[];
	resolveMilestoneLabel: MilestoneFilterValueResolver;
} {
	return {
		availableMilestoneTitles: activeMilestones.map((milestone) => milestone.title),
		resolveMilestoneLabel: createMilestoneFilterValueResolver([...activeMilestones, ...archivedMilestones]),
	};
}

export type TaskListBoundaryDirection = "up" | "down";
export type PendingSearchWrap = "to-first" | "to-last" | null;
type PaneFocus = "list" | "detail";

/** What vertical navigation should do next: keep moving, hand focus to search, or stay put. */
export type ListBoundaryNavigation = "move" | "search" | "stay";

/**
 * Resolves vertical navigation in the task list and in board columns. Arrow keys hand focus
 * to the search input at a boundary (and from an empty list), while vim keys stay inside the
 * list so j/k never leave it.
 */
export function resolveListBoundaryNavigation(
	direction: TaskListBoundaryDirection,
	selectedIndex: number,
	totalTasks: number,
	key: BoundaryNavigationKey,
): ListBoundaryNavigation {
	const atBoundary = totalTasks <= 0 || (direction === "up" ? selectedIndex <= 0 : selectedIndex >= totalTasks - 1);
	if (!atBoundary) {
		return "move";
	}
	return key === "arrow" ? "search" : "stay";
}

/** The detail pane hands focus back to search only when the up arrow is pressed at the top. */
export function shouldMoveFromDetailBoundaryToSearch(scrollOffset: number, key: BoundaryNavigationKey): boolean {
	return key === "arrow" && scrollOffset <= 0;
}

export function resolveSearchExitTargetIndex(
	direction: "up" | "down" | "escape",
	pendingWrap: PendingSearchWrap,
	totalTasks: number,
	currentIndex: number | undefined,
): number | undefined {
	if (totalTasks <= 0) {
		return undefined;
	}
	if (direction === "up" && pendingWrap === "to-last") {
		return totalTasks - 1;
	}
	if (direction === "down" && pendingWrap === "to-first") {
		return 0;
	}
	return currentIndex;
}

export function resolveFilterExitPane(
	preferredPane: PaneFocus,
	hasTaskList: boolean,
	hasDetailPane: boolean,
): PaneFocus | null {
	if (preferredPane === "detail" && hasDetailPane) {
		return "detail";
	}
	if (hasTaskList) {
		return "list";
	}
	if (hasDetailPane) {
		return "detail";
	}
	return null;
}

export function resolveTaskListSelection<T>(
	items: readonly T[],
	selectedIndex: number | number[] | undefined,
	fallback: T | null = null,
): T | null {
	const index = Array.isArray(selectedIndex) ? selectedIndex[0] : selectedIndex;
	if (typeof index !== "number") {
		return fallback;
	}
	return items[index] ?? fallback;
}

/**
 * Merge the unfiltered readiness snapshot with the live display copies into the corpus the
 * dependency graph and readiness resolve against.
 *
 * Live copies win over the snapshot so status edits made in this session count. The merge works on
 * claimant groups rather than single records: an identity that either side holds more than once
 * keeps every claimant, so the shared record index still reports it ambiguous exactly as the CLI
 * does, instead of this merge quietly electing a winner.
 */
export function mergeDependencyCorpusTasks(snapshot: Task[], liveTasks: Task[]): Task[] {
	const groupById = (tasks: Task[]) => {
		const groups = new Map<string, Task[]>();
		for (const task of tasks) {
			const key = canonicalTaskId(task.id);
			const group = groups.get(key);
			if (group) group.push(task);
			else groups.set(key, [task]);
		}
		return groups;
	};

	const groups = groupById(snapshot);
	for (const [key, liveClaimants] of groupById(liveTasks)) {
		const snapshotClaimants = groups.get(key);
		// A live copy cannot be attributed to either claimant of a contested identity, so the
		// snapshot's ambiguity stands until the view reloads.
		if (snapshotClaimants && snapshotClaimants.length > 1) continue;
		groups.set(key, liveClaimants);
	}
	return [...groups.values()].flat();
}

/**
 * Display task details with search/filter header UI
 */
/**
 * Persistent one-line warning bar rendered above the help bar. Used for
 * data-integrity alerts (e.g. duplicate task IDs) that must stay visible
 * instead of expiring like transient help messages.
 */
export function createStartupWarningBar(parent: BoxInterface, message: string): BoxInterface {
	return box({
		parent,
		bottom: 1,
		left: 0,
		width: "100%",
		height: 1,
		tags: true,
		wrap: false,
		content: ` {yellow-fg}${message}{/}`,
	});
}

export async function viewTaskEnhanced(
	task: Task,
	options: {
		tasks?: Task[];
		core?: Core;
		/** Screen to draw on. Tests pass their own; by default the viewer creates one. */
		screen?: ScreenInterface;
		title?: string;
		filterDescription?: string;
		searchQuery?: string;
		statusFilter?: string | string[];
		excludeStatus?: string[];
		typeFilter?: string[];
		projectFilter?: string[];
		priorityFilter?: string;
		milestoneFilter?: string;
		labelFilter?: string[];
		labelMatch?: LabelMatchMode;
		readyFilter?: boolean;
		/** Unfiltered corpus for dependency readiness; defaults to the tasks being displayed. */
		readinessTasks?: Task[];
		limit?: number;
		/** The `--sort` value the list was opened with. Without one the list is in the default order. */
		sort?: string;
		/** Start on the first listed row instead of on `task`, for a list opened without a chosen task. */
		startOnFirstRow?: boolean;
		startWithDetailFocus?: boolean;
		startWithSearchFocus?: boolean;
		startupWarning?: string;
		viewSwitcher?: import("./view-switcher.ts").ViewSwitcher;
		subscribeUpdates?: (
			update: (nextTasks: Task[], nextStatuses: string[], nextLabels: string[], nextSelectedTask?: Task) => void,
		) => void;
		onTaskChange?: (task: Task) => void;
		onTabPress?: () => Promise<void>;
		onFilterChange?: (filters: {
			searchQuery: string;
			statusFilter: string[];
			excludeStatus: string[];
			typeFilter: string[];
			projectFilter: string[];
			priorityFilter: string;
			labelFilter: string[];
			labelMatch?: LabelMatchMode;
			milestoneFilter: string;
		}) => void;
	} = {},
): Promise<void> {
	if (output.isTTY === false) {
		console.log(formatTaskPlainText(await loadTaskDetail(options.core ?? (await createRuntimeCore()), task)));
		return;
	}

	// Reuse the caller's Core so every surface reads the same project root.
	const core = options.core || (await createRuntimeCore({ enableWatchers: true }));

	// Show loading screen while loading tasks (can be slow with cross-branch loading)
	let allTasks: Task[];
	let statuses: string[];
	let labels: string[];
	let priorityOptions = getPriorityOptions();
	let configuredTaskTypes = getTaskTypeValues();
	let configuredProjects = getProjectValues();
	let availableLabels: string[] = [];
	let contentStore: Awaited<ReturnType<typeof core.getContentStore>> | null = null;
	// Archived tasks are loaded alongside the milestone metadata so dependency readiness can
	// resolve dependencies that already left the active corpus, without a second full task load.
	const [milestoneEntities, archivedMilestones, archivedTasks] = await Promise.all([
		core.filesystem.listMilestones(),
		core.filesystem.listArchivedMilestones(),
		core.filesystem.listArchivedTasks(),
	]);
	const { availableMilestoneTitles, resolveMilestoneLabel } = buildTaskViewerMilestoneFilterModel(
		milestoneEntities,
		archivedMilestones,
	);

	let dateFormat: string | undefined;
	let projectName: string | undefined;

	if (options.tasks) {
		// Tasks already provided - no ContentStore loading
		allTasks = options.tasks.filter((t) => t.id && t.id.trim() !== "" && hasAnyPrefix(t.id));
		const config = await core.filesystem.loadConfig();
		statuses = config?.statuses || ["To Do", "In Progress", "Done"];
		labels = config?.labels || [];
		priorityOptions = getPriorityOptions(config);
		configuredTaskTypes = getTaskTypeValues(config);
		configuredProjects = getProjectValues(config);
		dateFormat = config?.dateFormat;
		projectName = config?.projectName;
	} else {
		// Need to load tasks - show loading screen
		const loadingScreen = await createLoadingScreen(t("loading.tasks"));
		try {
			loadingScreen?.update(t("loading.config"));
			const config = await core.filesystem.loadConfig();
			statuses = config?.statuses || ["To Do", "In Progress", "Done"];
			labels = config?.labels || [];
			priorityOptions = getPriorityOptions(config);
			configuredTaskTypes = getTaskTypeValues(config);
			configuredProjects = getProjectValues(config);
			dateFormat = config?.dateFormat;
			projectName = config?.projectName;

			loadingScreen?.update(t("loading.branches"));
			contentStore = await core.getContentStore();

			loadingScreen?.update(t("loading.preparing"));
			const tasks = await core.queryTasks();
			allTasks = tasks.filter((t) => t.id && t.id.trim() !== "" && hasAnyPrefix(t.id));
		} finally {
			await loadingScreen?.close();
		}
	}

	// One shared index over the loaded corpus, however that corpus arrived. Searching exactly the
	// tasks this list renders is what keeps its results identical to the other surfaces'.
	let taskSearchIndex = createTaskSearchIndex(allTasks);
	const priorityOrder = priorityOptions.map((priority) => priority.value);

	// Collect available labels from config, tasks, and CLI-provided filters.
	availableLabels = collectAvailableLabels(allTasks, [...labels, ...(options.labelFilter ?? [])]);

	// Dependency readiness must resolve against the whole corpus, not the filtered display list, so
	// it uses the unfiltered snapshot when the caller narrowed what is shown. Both sides stay
	// mutable because archiving a task from this view moves it between them.
	let readinessSnapshot = options.readinessTasks ? [...options.readinessTasks] : null;
	const readinessArchivedTasks = [...archivedTasks];
	// The corpus that both readiness and the dependency graph resolve against, so the two never
	// disagree about which records this view can see.
	const resolveDependencyCorpus = (): TaskCorpus => {
		let tasks = allTasks;
		if (readinessSnapshot) {
			tasks = mergeDependencyCorpusTasks(readinessSnapshot, allTasks);
		}
		return { tasks, archivedTasks: readinessArchivedTasks, statuses };
	};

	// State for filtering - normalize filters to match configured values
	let searchQuery = options.searchQuery || "";

	// Keep the requested statuses that match configured ones (case-insensitive), in config order
	let statusFilter: string[] = [];
	if (options.statusFilter && options.statusFilter.length > 0) {
		const requested = new Set(
			(Array.isArray(options.statusFilter) ? options.statusFilter : [options.statusFilter]).map((status) =>
				status.trim().toLowerCase(),
			),
		);
		statusFilter = statuses.filter((status) => requested.has(status.toLowerCase()));
	}
	const excludeStatusFilter = [...(options.excludeStatus ?? [])];

	let taskTypeFilter = resolveTaskTypeValues(options.typeFilter ?? [], configuredTaskTypes).values;
	let projectFilter = resolveProjectValues(options.projectFilter ?? [], configuredProjects).values;
	let priorityFilter = normalizePriorityValue(options.priorityFilter) || "";
	let labelFilter: string[] = [];
	let milestoneFilter = options.milestoneFilter || "";
	let labelMatch: LabelMatchMode = options.labelMatch ?? "any";
	const taskLimit = options.limit;

	if (options.labelFilter && options.labelFilter.length > 0) {
		const availableSet = new Set(availableLabels.map((label) => label.toLowerCase()));
		labelFilter = options.labelFilter.filter((label) => availableSet.has(label.toLowerCase()));
	}

	// A list that opens narrowed starts on its first row, because `task` may not be among its
	// rows. Every filter that narrows the list has to be listed here, or the first render keeps
	// showing `task` although the filter left it out.
	const filtersActive = Boolean(
		searchQuery ||
			statusFilter.length > 0 ||
			excludeStatusFilter.length > 0 ||
			taskTypeFilter.length > 0 ||
			projectFilter.length > 0 ||
			priorityFilter ||
			labelFilter.length > 0 ||
			milestoneFilter ||
			options.readyFilter ||
			taskLimit !== undefined,
	);
	let startOnFirstRow = filtersActive || Boolean(options.startOnFirstRow);

	const enrichTask = (candidate: Task | null): Task | null => {
		if (!candidate) return null;
		return attachSubtaskSummaries(candidate, allTasks);
	};

	// Find the initial selected task
	let currentSelectedTask = enrichTask(task) ?? task;
	let selectionRequestId = 0;
	let noResultsMessage: string | null = null;

	const screenTitle = formatTuiTitle(options.title || t("title.tasks"), projectName);
	const screen = options.screen ?? createScreen({ title: screenTitle });

	// Main container
	const container = box({
		parent: screen,
		width: "100%",
		height: "100%",
	});

	// State for tracking focus
	let currentFocus: "filters" | "list" | "detail" = "list";
	let filterPopupOpen = false;
	let modalOpen = false;
	let pendingSearchWrap: PendingSearchWrap = null;
	let filterExitPane: PaneFocus = "list";

	// Create filter header component
	let filterHeader: FilterHeader;

	const focusFilterControl = (filterId: FilterControlId) => {
		switch (filterId) {
			case "search":
				filterHeader.focusSearch();
				break;
			case "status":
				filterHeader.focusStatus();
				break;
			case "type":
				filterHeader.focusType();
				break;
			case "project":
				filterHeader.focusProject();
				break;
			case "priority":
				filterHeader.focusPriority();
				break;
			case "milestone":
				filterHeader.focusMilestone();
				break;
			case "labels":
				filterHeader.focusLabels();
				break;
		}
	};

	const openFilterPicker = async (filterId: Exclude<FilterControlId, "search">) => {
		if (filterPopupOpen) {
			return;
		}
		filterPopupOpen = true;

		try {
			if (filterId === "type") {
				const nextTypes = await openMultiSelectFilterPopup({
					screen,
					title: t("filter.typeTitle"),
					items: configuredTaskTypes,
					selectedItems: taskTypeFilter,
				});
				if (nextTypes !== null) {
					taskTypeFilter = nextTypes;
					filterHeader.setFilters({ taskTypes: nextTypes });
					applyFilters();
					notifyFilterChange();
				}
				return;
			}

			if (filterId === "project") {
				const nextProjects = await openMultiSelectFilterPopup({
					screen,
					title: t("filter.projectTitle"),
					items: configuredProjects,
					selectedItems: projectFilter,
				});
				if (nextProjects !== null) {
					projectFilter = nextProjects;
					filterHeader.setFilters({ projects: nextProjects });
					applyFilters();
					notifyFilterChange();
				}
				return;
			}

			if (filterId === "labels") {
				const nextLabels = await openMultiSelectFilterPopup({
					screen,
					title: t("filter.labelTitle"),
					items: [...availableLabels].sort((a, b) => a.localeCompare(b)),
					selectedItems: labelFilter,
				});
				if (nextLabels !== null) {
					labelFilter = nextLabels;
					labelMatch = "any";
					filterHeader.setFilters({ labels: nextLabels });
					applyFilters();
					notifyFilterChange();
				}
				return;
			}

			if (filterId === "status") {
				const nextStatuses = await openMultiSelectFilterPopup({
					screen,
					title: t("filter.statusTitle"),
					items: statuses,
					selectedItems: statusFilter,
				});
				if (nextStatuses !== null) {
					statusFilter = nextStatuses;
					filterHeader.setFilters({ status: nextStatuses });
					applyFilters();
					notifyFilterChange();
				}
				return;
			}

			if (filterId === "priority") {
				const selected = await openSingleSelectFilterPopup({
					screen,
					title: t("filter.priorityTitle"),
					selectedValue: priorityFilter,
					choices: [
						{ label: "All", value: "" },
						...priorityOptions.map((priority) => ({ label: priority.label, value: priority.value })),
					],
				});
				if (selected !== null) {
					priorityFilter = selected;
					filterHeader.setFilters({ priority: selected });
					applyFilters();
					notifyFilterChange();
				}
				return;
			}

			const selected = await openSingleSelectFilterPopup({
				screen,
				title: t("filter.milestoneTitle"),
				selectedValue: milestoneFilter,
				choices: [
					{ label: "All", value: "" },
					{ label: t("filter.noMilestone"), value: NO_MILESTONE_FILTER_VALUE },
					...availableMilestoneTitles.map((milestone) => ({ label: milestone, value: milestone })),
				],
			});
			if (selected !== null) {
				milestoneFilter = selected;
				filterHeader.setFilters({ milestone: selected });
				applyFilters();
				notifyFilterChange();
			}
		} finally {
			filterPopupOpen = false;
			focusFilterControl(filterId);
			screen.render();
		}
	};

	filterHeader = createFilterHeader({
		parent: container,
		statuses,
		availableLabels,
		availableMilestones: availableMilestoneTitles,
		visibleFilters: [
			"search",
			"status",
			"type",
			...(configuredProjects.length > 0 ? (["project"] as const) : []),
			"priority",
			"milestone",
			"labels",
		],
		initialFilters: {
			search: searchQuery,
			status: statusFilter,
			taskTypes: taskTypeFilter,
			projects: projectFilter,
			priority: priorityFilter,
			labels: labelFilter,
			milestone: milestoneFilter,
		},
		onFilterChange: (filters: FilterState) => {
			const labelsChanged = !areLabelSelectionsEqual(labelFilter, filters.labels);
			searchQuery = filters.search;
			statusFilter = filters.status;
			taskTypeFilter = filters.taskTypes;
			projectFilter = filters.projects;
			priorityFilter = filters.priority;
			labelFilter = filters.labels;
			if (labelsChanged) {
				labelMatch = "any";
			}
			milestoneFilter = filters.milestone;
			applyFilters();
			notifyFilterChange();
		},
		onFilterPickerOpen: (filterId) => {
			void openFilterPicker(filterId);
		},
	});

	// Handle focus changes from filter header
	filterHeader.setFocusChangeHandler((focus) => {
		if (focus !== null) {
			if (currentFocus !== "filters") {
				filterExitPane = currentFocus === "detail" ? "detail" : "list";
			}
			currentFocus = "filters";
			setActivePane("none");
			updateHelpBar();
		}
	});
	filterHeader.setExitRequestHandler((direction) => {
		filterHeader.setBorderColor("cyan");
		const targetPane = resolveFilterExitPane(filterExitPane, Boolean(taskList), Boolean(descriptionBox));
		if (targetPane === "list" && taskList) {
			const selected = taskList.getSelectedIndex();
			const currentIndex = Array.isArray(selected) ? selected[0] : selected;
			const targetIndex = resolveSearchExitTargetIndex(
				direction,
				pendingSearchWrap,
				filteredTasks.length,
				currentIndex,
			);
			focusTaskList(targetIndex);
		} else if (targetPane === "detail" && descriptionBox) {
			focusDetailPane();
		}
		pendingSearchWrap = null;
	});

	// Get dynamic header height
	const getHeaderHeight = () => filterHeader.getHeight();

	// Task list pane (left 40%)
	const taskListPane = box({
		parent: container,
		top: getHeaderHeight(),
		left: 0,
		width: "40%",
		height: `100%-${getHeaderHeight() + 1}`,
		border: { type: "line" },
		style: { border: { fg: "gray" } },
		// Every task is listed until a filter or a limit narrows the list; applyFilters() then sets
		// the count of the rows that are left.
		label: `\u00A0${t("tui.tasksLabel", { count: allTasks.length })}\u00A0`,
	});

	// Detail pane - use right: 0 to ensure it extends to window edge
	const detailPane = box({
		parent: container,
		top: getHeaderHeight(),
		left: "40%",
		right: 0,
		height: `100%-${getHeaderHeight() + 1}`,
		border: { type: "line" },
		style: { border: { fg: "gray" } },
		label: "\u00A0Details\u00A0",
	});

	// Help bar at bottom
	const helpBar = box({
		parent: container,
		bottom: 0,
		left: 0,
		width: "100%",
		height: 1,
		tags: true,
		wrap: true,
		content: "",
	});
	const warningBar = options.startupWarning ? createStartupWarningBar(container, options.startupWarning) : null;
	let transientHelpContent: string | null = null;
	let helpRestoreTimer: ReturnType<typeof setTimeout> | null = null;

	function showTransientHelp(message: string, durationMs = 3000) {
		transientHelpContent = message;
		if (helpRestoreTimer) {
			clearTimeout(helpRestoreTimer);
			helpRestoreTimer = null;
		}
		updateHelpBar();
		helpRestoreTimer = setTimeout(() => {
			transientHelpContent = null;
			helpRestoreTimer = null;
			updateHelpBar();
		}, durationMs);
	}

	function getTerminalWidth(): number {
		return typeof screen.width === "number" ? screen.width : 80;
	}

	function syncPaneLayout() {
		const headerHeight = filterHeader.getHeight();
		const helpHeight = typeof helpBar.height === "number" ? helpBar.height : 1;
		let footerHeight = helpHeight;
		if (warningBar) {
			warningBar.bottom = helpHeight;
			footerHeight += 1;
		}
		taskListPane.top = headerHeight;
		taskListPane.height = `100%-${headerHeight + footerHeight}`;
		detailPane.top = headerHeight;
		detailPane.height = `100%-${headerHeight + footerHeight}`;
	}

	function setHelpBarContent(content: string) {
		const formatted = formatFooterContent(content, getTerminalWidth());
		helpBar.height = formatted.height;
		helpBar.setContent(formatted.content);
		syncPaneLayout();
	}

	function setActivePane(active: "list" | "detail" | "none") {
		const listBorder = taskListPane.style as { border?: { fg?: string } };
		const detailBorder = detailPane.style as { border?: { fg?: string } };
		if (listBorder.border) listBorder.border.fg = active === "list" ? "yellow" : "gray";
		if (detailBorder.border) detailBorder.border.fg = active === "detail" ? "yellow" : "gray";
	}

	function focusTaskList(targetIndex?: number): void {
		if (!taskList) {
			if (descriptionBox) {
				currentFocus = "detail";
				setActivePane("detail");
				descriptionBox.focus();
				updateHelpBar();
				screen.render();
			}
			return;
		}
		currentFocus = "list";
		setActivePane("list");
		if (typeof targetIndex === "number") {
			taskList.setSelectedIndex(targetIndex);
		}
		taskList.focus();
		updateHelpBar();
		screen.render();
	}

	function focusDetailPane(): void {
		if (!descriptionBox) return;
		currentFocus = "detail";
		setActivePane("detail");
		descriptionBox.focus();
		updateHelpBar();
		screen.render();
	}

	// Helper to notify filter changes
	function notifyFilterChange() {
		if (options.onFilterChange) {
			options.onFilterChange({
				searchQuery,
				statusFilter,
				excludeStatus: excludeStatusFilter,
				typeFilter: taskTypeFilter,
				projectFilter,
				priorityFilter,
				labelFilter,
				labelMatch,
				milestoneFilter,
			});
		}
	}

	// The rows of the list: the tasks `task list --plain` prints for the same filters, sort and
	// limit, in the order it prints them. Every render of the list takes its rows from here.
	function listRows(): Task[] {
		// An unset filter contributes no check, so this covers the no-filters case too.
		const nextFilteredTasks = applyTaskFilters(
			allTasks,
			{
				query: searchQuery,
				status: statusFilter.length > 0 ? [...statusFilter] : undefined,
				excludeStatus: excludeStatusFilter,
				type: taskTypeFilter,
				project: projectFilter,
				priority: priorityFilter || undefined,
				labels: labelFilter,
				labelMatch,
				milestone: milestoneFilter || undefined,
				resolveMilestoneLabel,
			},
			taskSearchIndex,
		);
		// Readiness is derived over the filtered list in one pass against the whole corpus, so a
		// dependency the other filters hid still decides the verdict.
		const readyFilteredTasks = options.readyFilter
			? withReadiness(nextFilteredTasks, resolveDependencyCorpus()).filter((task) => task.isReady)
			: nextFilteredTasks;
		// Sorted, cut by the limit, then section after section.
		const sortedTasks = sortTasks(readyFilteredTasks, options.sort, priorityOrder);
		const limitedTasks = taskLimit !== undefined ? sortedTasks.slice(0, taskLimit) : sortedTasks;
		return sectionTasks(limitedTasks, options.sort, statuses).flatMap((section) => section.tasks);
	}

	// Recomputes the rows and refreshes the task list, keeping the selection on the same task. When
	// that task is no longer among the rows, the selection moves to the first row.
	function applyFilters() {
		filteredTasks = listRows();
		taskRowPrefix = createTaskRowPrefix(filteredTasks, { showStatus: true });

		// Update the task list label
		if (taskListPane.setLabel) {
			taskListPane.setLabel(`\u00A0${t("tui.tasksLabel", { count: filteredTasks.length })}\u00A0`);
		}

		if (filteredTasks.length === 0) {
			replaceTaskList();
			const activeFilters: string[] = [];
			const trimmedQuery = searchQuery.trim();
			if (trimmedQuery) {
				activeFilters.push(`${t("viewer.filterSearch")} {cyan-fg}${trimmedQuery}{/}`);
			}
			if (statusFilter.length > 0) {
				activeFilters.push(
					`${t("viewer.filterStatus")} {cyan-fg}${statusFilter.map((status) => translateStatus(status)).join(", ")}{/}`,
				);
			}
			if (excludeStatusFilter.length > 0) {
				activeFilters.push(
					`${t("viewer.filterExcludeStatus")} {cyan-fg}${excludeStatusFilter.map((status) => translateStatus(status)).join(", ")}{/}`,
				);
			}
			if (taskTypeFilter.length > 0) {
				activeFilters.push(`${t("viewer.filterType")} {magenta-fg}${taskTypeFilter.join(", ")}{/}`);
			}
			if (projectFilter.length > 0) {
				activeFilters.push(`${t("viewer.filterProject")} {blue-fg}${projectFilter.join(", ")}{/}`);
			}
			if (priorityFilter) {
				activeFilters.push(`${t("viewer.filterPriority")} {cyan-fg}${priorityFilter}{/}`);
			}
			if (labelFilter.length > 0) {
				activeFilters.push(`${t("viewer.filterLabels")} {yellow-fg}${labelFilter.join(", ")}{/}`);
			}
			if (milestoneFilter) {
				const milestoneFilterLabel =
					milestoneFilter === NO_MILESTONE_FILTER_VALUE ? t("filter.noMilestone") : milestoneFilter;
				activeFilters.push(`${t("viewer.filterMilestone")} {magenta-fg}${milestoneFilterLabel}{/}`);
			}
			let listPaneMessage: string;
			if (activeFilters.length > 0) {
				noResultsMessage = `{bold}${t("viewer.noFilterMatch")}{/bold}\n${activeFilters.map((f) => ` • ${f}`).join("\n")}\n\n{gray-fg}${t("viewer.adjustFilters")}{/}`;
				listPaneMessage = `{bold}${t("viewer.noMatchingTasks")}{/bold}\n\n${activeFilters.map((f) => ` • ${f}`).join("\n")}`;
			} else {
				noResultsMessage = `{bold}${t("viewer.noTasksAvailable")}{/bold}\n{gray-fg}${t("viewer.createHint", { command: "{cyan-fg}backlog task create{/cyan-fg}" })}{/}`;
				listPaneMessage = `{bold}${t("viewer.noTasksAvailable")}{/bold}`;
			}
			showListEmptyState(listPaneMessage);
			refreshDetailPane();
			screen.render();
			return;
		}

		noResultsMessage = null;
		hideListEmptyState();

		const listController = replaceTaskList();
		if (listController) {
			const forceFirst = startOnFirstRow;
			let desiredIndex = filteredTasks.findIndex((t) => t.id === currentSelectedTask.id);
			if (forceFirst || desiredIndex < 0) {
				desiredIndex = 0;
			}
			const desiredTask = filteredTasks[desiredIndex];
			if (desiredTask && desiredTask.id !== currentSelectedTask.id) {
				currentSelectedTask = enrichTask(desiredTask) ?? desiredTask;
				options.onTaskChange?.(currentSelectedTask);
			}
			const currentIndexRaw = listController.getSelectedIndex();
			const currentIndex = Array.isArray(currentIndexRaw) ? (currentIndexRaw[0] ?? 0) : currentIndexRaw;
			if (forceFirst || currentIndex !== desiredIndex) {
				listController.setSelectedIndex(desiredIndex);
			}
			startOnFirstRow = false;
		}

		// Ensure detail pane is refreshed when transitioning from no-results to results
		refreshDetailPane();
		screen.render();
	}

	// Task list component
	let taskList: GenericList<Task> | null = null;
	let listEmptyStateBox: BoxInterface | null = null;

	function showListEmptyState(message: string) {
		if (listEmptyStateBox) {
			listEmptyStateBox.destroy();
		}
		listEmptyStateBox = box({
			parent: taskListPane,
			top: 1,
			left: 1,
			width: "100%-4",
			height: "100%-3",
			content: message,
			tags: true,
			style: { fg: "gray" },
		});
	}

	function hideListEmptyState() {
		if (listEmptyStateBox) {
			listEmptyStateBox.destroy();
			listEmptyStateBox = null;
		}
	}

	async function applySelection(selectedTask: Task | null) {
		if (!selectedTask) return;
		if (currentSelectedTask && selectedTask.id === currentSelectedTask.id) {
			return;
		}
		const enriched = enrichTask(selectedTask);
		currentSelectedTask = enriched ?? selectedTask;
		options.onTaskChange?.(currentSelectedTask);
		const requestId = ++selectionRequestId;
		refreshDetailPane();
		screen.render();
		const refreshed = await core.getTaskWithSubtasks(selectedTask.id, allTasks);
		if (requestId !== selectionRequestId) {
			return;
		}
		if (refreshed) {
			currentSelectedTask = refreshed;
			options.onTaskChange?.(refreshed);
		}
		refreshDetailPane();
		screen.render();
	}

	// To rebuild the list call replaceTaskList() instead: it also keeps focus and removes the list this replaces.
	function createTaskList(): GenericList<Task> {
		const initialIndex = Math.max(
			0,
			filteredTasks.findIndex((t) => t.id === currentSelectedTask.id),
		);

		const list = createGenericList<Task>({
			parent: taskListPane,
			title: "",
			items: filteredTasks,
			selectedIndex: initialIndex,
			border: false,
			scrollbar: false,
			top: 1,
			left: 1,
			width: "100%-4",
			height: "100%-3",
			itemRenderer: (task: Task) =>
				formatTaskViewerListItem(task, dateFormat, configuredProjects, priorityOrder, taskRowPrefix),
			onSelect: (selected: Task | Task[]) => {
				const selectedTask = Array.isArray(selected) ? selected[0] : selected;
				void applySelection(selectedTask || null);
			},
			onHighlight: (selected: Task | null) => {
				void applySelection(selected);
			},
			onBoundaryNavigation: (direction, selectedIndex, total, key) => {
				const navigation = resolveListBoundaryNavigation(direction, selectedIndex, total, key);
				if (navigation === "move") {
					return false;
				}
				if (navigation === "search") {
					pendingSearchWrap = direction === "up" ? "to-last" : "to-first";
					filterHeader.focusSearch();
				}
				// "stay" consumes the key so vim navigation neither wraps nor leaves the list.
				return true;
			},
			showHelp: false,
		});

		// Focus handler for task list
		const listBox = list.getListBox();
		listBox.on("focus", () => {
			currentFocus = "list";
			setActivePane("list");
			screen.render();
			updateHelpBar();
		});
		listBox.on("blur", () => {
			setActivePane("none");
			screen.render();
		});
		listBox.key(["right", "l"], () => {
			focusDetailPane();
			return false;
		});

		return list;
	}

	/**
	 * Swaps the list widget for one built from the current `filteredTasks`, or for none when there
	 * is nothing to list. Every list rebuild goes through here so the list keeps keyboard focus.
	 *
	 * blessed gives the focus of a destroyed widget to whichever widget held it before (the search
	 * input, or nothing at all), never to the widget built in its place. So the replacement takes
	 * focus first, through the same focusTaskList() every other path uses, and only then is the
	 * old widget destroyed.
	 */
	function replaceTaskList(): GenericList<Task> | null {
		const previousList = taskList;
		const listHadFocus = previousList !== null && screen.focused === previousList.getListBox();
		taskList = filteredTasks.length > 0 ? createTaskList() : null;
		if (listHadFocus) {
			// With no list left, focusTaskList() moves to the detail pane.
			focusTaskList();
		}
		previousList?.destroy();
		return taskList;
	}

	// Detail pane widgets, replaced together by refreshDetailPane()
	let headerDetailBox: BoxInterface | undefined;
	let divider: LineInterface | undefined;
	let descriptionBox: ScrollableTextInterface | undefined;

	/**
	 * Rebuilds the detail pane for the current selection. It keeps keyboard focus the same way
	 * replaceTaskList() does: the new widgets take focus before the old ones are destroyed.
	 */
	function refreshDetailPane() {
		const previousWidgets = [headerDetailBox, divider, descriptionBox];
		const detailHadFocus = descriptionBox !== undefined && screen.focused === descriptionBox;
		buildDetailPane();
		if (detailHadFocus) {
			focusDetailPane();
		}
		for (const widget of previousWidgets) {
			widget?.destroy();
		}
	}

	// Call refreshDetailPane() instead: it also removes the widgets these replace.
	function buildDetailPane() {
		const configureDetailBox = (boxInstance: ScrollableTextInterface) => {
			descriptionBox = boxInstance;
			const scrollable = boxInstance as unknown as {
				scroll?: (offset: number) => void;
				setScroll?: (offset: number) => void;
				setScrollPerc?: (perc: number) => void;
				getScroll?: () => number;
			};

			const pageAmount = () => {
				const height = typeof boxInstance.height === "number" ? boxInstance.height : 0;
				return height > 0 ? Math.max(1, height - 3) : 0;
			};

			// Returning true leaves the key to the built-in scroll handling, which is clamped at the top.
			const moveUpFromDetail = (key: BoundaryNavigationKey) => {
				if (!shouldMoveFromDetailBoundaryToSearch(scrollable.getScroll?.() ?? 0, key)) {
					return true;
				}
				pendingSearchWrap = null;
				filterHeader.focusSearch();
				return false;
			};

			boxInstance.key(["up"], () => moveUpFromDetail("arrow"));
			boxInstance.key(["k"], () => moveUpFromDetail("vim"));

			boxInstance.key(["pageup", "b"], () => {
				const delta = pageAmount();
				if (delta > 0) {
					scrollable.scroll?.(-delta);
					screen.render();
				}
				return false;
			});
			boxInstance.key(["pagedown", "space"], () => {
				const delta = pageAmount();
				if (delta > 0) {
					scrollable.scroll?.(delta);
					screen.render();
				}
				return false;
			});
			boxInstance.key(["home", "g"], () => {
				scrollable.setScroll?.(0);
				screen.render();
				return false;
			});
			boxInstance.key(["end", "G"], () => {
				scrollable.setScrollPerc?.(100);
				screen.render();
				return false;
			});
			boxInstance.on("focus", () => {
				currentFocus = "detail";
				setActivePane("detail");
				updateHelpBar();
				screen.render();
			});
			boxInstance.on("blur", () => {
				if (currentFocus !== "detail") {
					setActivePane(currentFocus === "list" ? "list" : "none");
					screen.render();
				}
			});
			boxInstance.key(["left", "h"], () => {
				focusTaskList();
				return false;
			});
			boxInstance.key(["escape"], () => {
				focusTaskList();
				return false;
			});
		};

		if (noResultsMessage) {
			screen.title = screenTitle;

			headerDetailBox = box({
				parent: detailPane,
				top: 0,
				left: 1,
				right: 1,
				height: "shrink",
				tags: true,
				wrap: true,
				scrollable: false,
				padding: { left: 1, right: 1 },
				content: `{bold}${t("tui.noTasksToDisplay")}{/bold}`,
			});

			descriptionBox = undefined;
			divider = undefined;
			const messageBox = scrollabletext({
				parent: detailPane,
				top: (typeof headerDetailBox.bottom === "number" ? headerDetailBox.bottom : 0) + 1,
				left: 1,
				right: 1,
				bottom: 1,
				keys: true,
				vi: true,
				mouse: true,
				tags: true,
				wrap: true,
				padding: { left: 1, right: 1, top: 0, bottom: 0 },
				content: noResultsMessage,
			});

			configureDetailBox(messageBox);
			screen.render();
			return;
		}

		screen.title = formatTuiTitle(
			t("title.task", { id: currentSelectedTask.id, title: currentSelectedTask.title }),
			projectName,
		);

		const detailContent = generateDetailContent(toTaskDetail(currentSelectedTask, resolveDependencyCorpus()), {
			resolveMilestoneLabel,
			dateFormat,
			configuredProjects,
			configuredPriorities: priorityOrder,
		});

		// Calculate header height based on content and available width
		const detailPaneWidth = typeof detailPane.width === "number" ? detailPane.width : 60;
		const availableWidth = detailPaneWidth - 6; // 2 for border, 2 for box padding, 2 for header padding

		let headerLineCount = 0;
		for (const detailLine of detailContent.headerContent) {
			const plainText = detailLine.replace(/\{[^}]+\}/g, "");
			const lineCount = Math.max(1, Math.ceil(plainText.length / availableWidth));
			headerLineCount += lineCount;
		}

		headerDetailBox = box({
			parent: detailPane,
			top: 0,
			left: 1,
			right: 1,
			height: headerLineCount,
			tags: true,
			wrap: true,
			scrollable: false,
			padding: { left: 1, right: 1 },
			content: detailContent.headerContent.join("\n"),
		});

		divider = line({
			parent: detailPane,
			top: headerLineCount,
			left: 1,
			right: 1,
			orientation: "horizontal",
			style: { fg: "gray" },
		});

		const bodyContainer = scrollabletext({
			parent: detailPane,
			top: headerLineCount + 1,
			left: 1,
			right: 1,
			bottom: 1,
			keys: true,
			vi: true,
			mouse: true,
			tags: true,
			wrap: true,
			padding: { left: 1, right: 1, top: 0, bottom: 0 },
			content: detailContent.bodyContent.join("\n"),
			scrollbar: { ch: " ", inverse: true },
			style: { scrollbar: { bg: "gray" } },
		});

		configureDetailBox(bodyContainer);
	}

	// Dynamic help bar content
	function updateHelpBar() {
		if (transientHelpContent) {
			setHelpBarContent(transientHelpContent);
			screen.render();
			return;
		}

		let content = "";

		const filterFocus = filterHeader.getCurrentFocus();
		if (currentFocus === "filters" && filterFocus) {
			if (filterFocus === "search") {
				content = getFilterFooterContent("search", "task-list");
			} else {
				content = getFilterFooterContent("control", "task-list");
			}
		} else if (currentFocus === "detail") {
			content = footerLine(
				keyHint("Tab", t("key.view")),
				keyHint("←", t("key.list")),
				keyHint("↑↓", t("key.scroll")),
				keyHint("E", t("key.edit")),
				keyHint("Y", t("key.yank")),
				keyHint("?", t("key.help")),
				keyHint("q", t("key.quit")),
			);
		} else {
			// Task list help
			content = getTaskListFooterContent({ hasProjects: configuredProjects.length > 0 });
		}

		setHelpBarContent(content);
		screen.render();
	}

	const openCurrentTaskInEditor = async () => {
		if (filterPopupOpen || currentFocus === "filters" || noResultsMessage) {
			return;
		}
		const selectedTask = currentSelectedTask;

		try {
			const result = await core.editTaskInTui(selectedTask.id, screen, selectedTask);
			if (result.reason === "read_only") {
				showTransientHelp(formatReadOnlyNotice(result.task ?? selectedTask));
				return;
			}
			if (result.reason === "editor_failed") {
				showTransientHelp(` {red-fg}${t("tui.editorError")}{/}`);
				return;
			}
			if (result.reason === "not_found") {
				showTransientHelp(` {red-fg}${t("tui.taskNotFoundOnBranch", { id: selectedTask.id })}{/}`);
				return;
			}
			if (result.reason === "identity_conflict") {
				showTransientHelp(` {red-fg}${t("tui.identityMismatch")}{/}`);
				return;
			}
			if (result.reason === "unreadable") {
				showTransientHelp(` {red-fg}${t("tui.unreadableFile")}{/}`);
				return;
			}
			if (result.reason === "ambiguous") {
				showTransientHelp(` {red-fg}${t("tui.sharedDraftId")}{/}`);
				return;
			}

			if (result.task) {
				// Reconcile by file identity first: with task_prefix="draft" a task and a draft can
				// share one id, so an id match alone may target the wrong record.
				const index = allTasks.findIndex(
					(taskItem) =>
						(result.task?.filePath !== undefined &&
							taskItem.filePath !== undefined &&
							taskItem.filePath === result.task.filePath) ||
						taskItem.id === result.task?.id,
				);
				if (index >= 0) {
					allTasks[index] = result.task;
				}
				const enhancedTask = enrichTask(result.task) ?? result.task;
				currentSelectedTask = enhancedTask;
				options.onTaskChange?.(enhancedTask);
				taskSearchIndex = createTaskSearchIndex(allTasks);
			}

			applyFilters();
			if (result.changed) {
				showTransientHelp(` {green-fg}${t("tui.markedModified", { id: result.task?.id ?? selectedTask.id })}{/}`);
				return;
			}
			showTransientHelp(` {gray-fg}${t("tui.noChanges", { id: result.task?.id ?? selectedTask.id })}{/}`);
		} catch (_error) {
			showTransientHelp(` {red-fg}${t("tui.editorFailed")}{/}`);
		}
	};

	const getCurrentShortcutTask = (): Task | null => {
		if (noResultsMessage) {
			return null;
		}
		return resolveTaskListSelection(filteredTasks, taskList?.getSelectedIndex(), currentSelectedTask);
	};

	const removeTaskFromCurrentView = (taskId: string) => {
		const currentIndex = filteredTasks.findIndex((taskItem) => taskItem.id === taskId);
		const remainingFilteredTasks = filteredTasks.filter((taskItem) => taskItem.id !== taskId);
		const nextIndex = Math.min(Math.max(currentIndex, 0), remainingFilteredTasks.length - 1);
		const nextTask = remainingFilteredTasks[nextIndex] ?? null;

		allTasks = allTasks.filter((taskItem) => taskItem.id !== taskId);
		taskSearchIndex = createTaskSearchIndex(allTasks);
		if (nextTask) {
			currentSelectedTask = enrichTask(nextTask) ?? nextTask;
			options.onTaskChange?.(currentSelectedTask);
		}
		applyFilters();
	};

	const runWithModalGuard = async <T>(operation: () => Promise<T>): Promise<T> => {
		modalOpen = true;
		try {
			return await operation();
		} finally {
			modalOpen = false;
		}
	};

	const archiveCurrentTask = async (task: Task) => {
		const result = await archiveTaskFromTui(core, task, (popup) =>
			runWithModalGuard(() => openConfirmPopup({ screen, ...popup })),
		);
		if (result.archived) {
			// The record leaves the active graph and joins the archived one, where the tasks that
			// depend on it keep resolving it.
			readinessSnapshot = readinessSnapshot?.filter((candidate) => !taskIdsEqual(candidate.id, task.id)) ?? null;
			readinessArchivedTasks.push(task);
			removeTaskFromCurrentView(task.id);
		}
		const notice = formatArchiveNotice(task, result);
		if (notice) showTransientHelp(notice);
	};

	// Handle resize
	screen.on("resize", () => {
		filterHeader.rebuild();
		taskList?.updateItems(filteredTasks);
		updateHelpBar();
	});

	// Keyboard shortcuts
	screen.key(["/"], () => {
		if (modalOpen) return;
		pendingSearchWrap = null;
		filterHeader.focusSearch();
	});

	screen.key(["C-f"], () => {
		if (modalOpen) return;
		pendingSearchWrap = null;
		filterHeader.focusSearch();
	});

	screen.key(["s", "S"], () => {
		if (modalOpen) return;
		void openFilterPicker("status");
	});

	screen.key(["t", "T"], () => {
		if (modalOpen || filterPopupOpen) return;
		void openFilterPicker("type");
	});

	if (configuredProjects.length > 0) {
		// Not "g"/"G": those already scroll the detail pane to top/bottom (see the
		// boxInstance bindings above) and a screen-level handler here would conflict.
		screen.key(["v", "V"], () => {
			if (modalOpen || filterPopupOpen) return;
			void openFilterPicker("project");
		});
	}

	screen.key(["p", "P"], () => {
		if (modalOpen) return;
		void openFilterPicker("priority");
	});

	screen.key(["l", "L"], () => {
		if (modalOpen) return;
		void openFilterPicker("labels");
	});

	screen.key(["i", "I"], () => {
		if (modalOpen) return;
		void openFilterPicker("milestone");
	});

	screen.key(["e", "E", "S-e"], () => {
		if (modalOpen) return;
		void openCurrentTaskInEditor();
	});

	screen.key(["y", "Y"], async () => {
		if (modalOpen || filterPopupOpen || currentFocus === "filters") return;
		const task = getCurrentShortcutTask();
		if (!task) return;
		const success = await copyToClipboard(task.id);
		if (success) {
			showTransientHelp(` {green-fg}${t("tui.copied", { id: task.id })}{/}`);
		} else {
			showTransientHelp(` {red-fg}${t("tui.copyFailed")}{/}`);
		}
	});

	screen.key(["a", "A"], async () => {
		if (modalOpen || filterPopupOpen || currentFocus === "filters") return;
		const task = getCurrentShortcutTask();
		if (!task) return;
		await archiveCurrentTask(task);
	});

	screen.key(["?"], async () => {
		if (modalOpen || filterPopupOpen) return;
		await runWithModalGuard(() => openHelpPopup(screen, "task-list", { hasProjects: configuredProjects.length > 0 }));
	});

	screen.key(["escape"], () => {
		if (modalOpen || filterPopupOpen) {
			return;
		}
		if (currentFocus === "filters") {
			filterHeader.setBorderColor("cyan");
			const targetPane = resolveFilterExitPane(filterExitPane, Boolean(taskList), Boolean(descriptionBox));
			if (targetPane === "list" && taskList) {
				focusTaskList();
			} else if (targetPane === "detail" && descriptionBox) {
				focusDetailPane();
			}
		} else if (currentFocus !== "list") {
			if (taskList) {
				focusTaskList();
			}
		} else {
			// If already in task list, quit
			contentStore?.dispose();
			filterHeader.destroy();
			screen.destroy();
			process.exit(0);
		}
	});

	// Tab key handling for view switching - only when in task list
	if (options.onTabPress) {
		screen.key(["tab"], async () => {
			// Keep tab as filter-navigation while filters are focused.
			if (modalOpen || filterPopupOpen || currentFocus === "filters") {
				return;
			}
			if (currentFocus === "list" || currentFocus === "detail") {
				// Cleanup before switching
				contentStore?.dispose();
				filterHeader.destroy();
				screen.destroy();
				await options.onTabPress?.();
			}
		});
	}

	// Quit handlers
	screen.key(["q", "C-c"], () => {
		if (modalOpen || filterPopupOpen) {
			return;
		}
		contentStore?.dispose();
		filterHeader.destroy();
		screen.destroy();
		process.exit(0);
	});

	// Initial setup
	updateHelpBar();

	// The rows the list shows. applyFilters() replaces them whenever the tasks or the filters change.
	let filteredTasks = listRows();
	let taskRowPrefix = createTaskRowPrefix(filteredTasks, { showStatus: true });

	// A list opened on a chosen task keeps showing that task's details even when the list has no
	// rows (a draft opened in a project without tasks, for example). Otherwise it starts on its
	// first row.
	if (startOnFirstRow) {
		applyFilters();
	} else {
		taskList = createTaskList();
	}
	options.subscribeUpdates?.((nextTasks, nextStatuses, nextLabels, nextSelectedTask) => {
		allTasks = nextTasks;
		statuses = nextStatuses;
		labels = nextLabels;
		availableLabels = collectAvailableLabels(allTasks, labels);
		taskSearchIndex = createTaskSearchIndex(allTasks);

		const previousTaskId = currentSelectedTask.id;
		const currentTask =
			allTasks.find((candidate) => candidate.id === nextSelectedTask?.id) ??
			allTasks.find((candidate) => candidate.id === currentSelectedTask.id) ??
			allTasks[0];
		if (currentTask) {
			currentSelectedTask = enrichTask(currentTask) ?? currentTask;
			if (currentSelectedTask.id !== previousTaskId) options.onTaskChange?.(currentSelectedTask);
		}
		applyFilters();
	});
	refreshDetailPane();

	if (options.startWithSearchFocus) {
		filterHeader.focusSearch();
	} else if (options.startWithDetailFocus) {
		if (descriptionBox) {
			focusDetailPane();
		}
	} else {
		// Focus the task list initially and highlight it
		if (taskList) {
			focusTaskList();
		}
	}

	screen.render();

	// Wait for screen to close
	return new Promise<void>((resolve) => {
		screen.on("destroy", () => {
			if (helpRestoreTimer) {
				clearTimeout(helpRestoreTimer);
				helpRestoreTimer = null;
			}
			contentStore?.dispose();
			resolve();
		});
	});
}

export interface TaskDetailContentOptions {
	resolveMilestoneLabel?: (milestone: string) => string;
	dateFormat?: string;
	configuredProjects?: string[];
	/** The configured priorities, highest first. The priority marker takes its direction from them. */
	configuredPriorities?: readonly string[];
}

export function generateDetailContent(
	task: Task | TaskDetail,
	options: TaskDetailContentOptions = {},
): { headerContent: string[]; bodyContent: string[] } {
	const { resolveMilestoneLabel, dateFormat, configuredProjects, configuredPriorities } = options;
	const headerContent = [
		` ${wrapStatusColor(formatStatusWithIcon(task.status, translateStatus(task.status)), getStatusColor(task.status))} {bold}{blue-fg}${task.id}{/blue-fg}{/bold} - ${task.title}`,
	];

	// Add cross-branch indicator if task is from another branch
	const isCrossBranch = Boolean((task as Task & { branch?: string }).branch);
	if (isCrossBranch) {
		const branchName = (task as Task & { branch?: string }).branch;
		headerContent.push(
			` {yellow-fg}${t("detail.readOnlyLabel")}{/} ${t("detail.readOnlyBranch", { branch: `{green-fg}${branchName}{/}` })}`,
		);
	}

	if (task.source === "archived") {
		headerContent.push(` {yellow-fg}${t("detail.readOnlyLabel")}{/} ${t("detail.readOnlyArchived")}`);
	}

	const bodyContent: string[] = [];
	bodyContent.push(formatHeading(t("detail.details"), 2));

	const metadata: string[] = [];
	metadata.push(`{bold}${t("detail.created")}{/bold} ${formatDateForDisplay(task.createdDate, { dateFormat })}`);
	if (task.updatedDate && task.updatedDate !== task.createdDate) {
		metadata.push(`{bold}${t("detail.updated")}{/bold} ${formatDateForDisplay(task.updatedDate, { dateFormat })}`);
	}
	if (task.dueDate) {
		metadata.push(`{bold}${t("detail.due")}{/bold} ${formatDateForDisplay(task.dueDate, { dateFormat })}`);
	}
	if (task.priority) {
		const priorityMarker = formatPriorityMarker(task.priority, configuredPriorities);
		const priorityText = formatPriorityLabel(task.priority);
		metadata.push(`{bold}${t("detail.priority")}{/bold} ${priorityText}${priorityMarker ? ` ${priorityMarker}` : ""}`);
	}
	if (task.type) {
		metadata.push(`{bold}${t("detail.type")}{/bold} ${formatTaskTypeBadge(task.type)}`);
	}
	if (task.project && configuredProjects?.length) {
		metadata.push(`{bold}${t("detail.project")}{/bold} ${formatProjectBadge(task.project, configuredProjects)}`);
	}
	if (task.assignee?.length) {
		const assigneeList = task.assignee.map((a) => (a.startsWith("@") ? a : `@${a}`)).join(", ");
		metadata.push(`{bold}${t("detail.assignee")}{/bold} {cyan-fg}${assigneeList}{/}`);
	}
	if (task.labels?.length) {
		metadata.push(`{bold}${t("detail.labels")}{/bold} ${task.labels.map((l) => `{yellow-fg}[${l}]{/}`).join(" ")}`);
	}
	if (task.reporter) {
		const reporterText = task.reporter.startsWith("@") ? task.reporter : `@${task.reporter}`;
		metadata.push(`{bold}${t("detail.reporter")}{/bold} {cyan-fg}${reporterText}{/}`);
	}
	if (task.milestone) {
		const milestoneLabel = resolveMilestoneLabel ? resolveMilestoneLabel(task.milestone) : task.milestone;
		metadata.push(`{bold}${t("detail.milestone")}{/bold} {magenta-fg}${milestoneLabel}{/}`);
	}
	if (task.parentTaskId) {
		const parentLabel = task.parentTaskTitle ? `${task.parentTaskId} - ${task.parentTaskTitle}` : task.parentTaskId;
		metadata.push(`{bold}${t("detail.parent")}{/bold} {blue-fg}${parentLabel}{/}`);
	}
	if (task.subtasks?.length) {
		metadata.push(
			`{bold}${t("detail.subtasks")}{/bold} ${t(task.subtasks.length > 1 ? "detail.subtaskCountMany" : "detail.subtaskCountOne", { count: task.subtasks.length })}`,
		);
	}
	if (task.dependencies?.length) {
		// The Dependency Graph section below names the same dependencies and resolves them, so the
		// raw ID list is not repeated here. Readiness stays: it is a verdict, not a restatement.
		// It is rendered only when the caller was handed a detail read that carries it: a caller
		// without one (the board quick-look popup) gets no readiness line rather than a guess.
		const readiness = taskReadiness(task);
		if (readiness) {
			if (readiness.isReady) {
				metadata.push(`{bold}${t("detail.readiness")}{/bold} {green-fg}${t("detail.ready")}{/}`);
			} else if (readiness.isBlocked) {
				// Single-width glyphs only: blessed miscounts East Asian Wide characters and leaves
				// stale cells behind when the detail pane re-renders a shorter line.
				metadata.push(`{bold}${t("detail.readiness")}{/bold} {yellow-fg}● ${formatReadinessBlockers(readiness)}{/}`);
			}
		}
	}
	if (task.modifiedFiles?.length) {
		metadata.push(`{bold}${t("detail.modifiedFiles")}{/bold} ${task.modifiedFiles.join(", ")}`);
	}

	bodyContent.push(metadata.join("\n"));
	bodyContent.push("");

	// Directly below the details block and above the description, the same relative position the
	// canonical CLI plain output uses. This builder is not shared with the plain formatter, so the
	// order is kept deliberately in step rather than inherited.
	const dependencyGraph = taskDependencyGraph(task);
	const dependencyGraphLines = dependencyGraph
		? formatDependencyGraphLines(dependencyGraph, { formatLabel: formatDependencyNodeTuiLabel })
		: [];
	if (dependencyGraphLines.length > 0) {
		bodyContent.push(formatHeading(t("detail.dependencyGraph"), 2));
		bodyContent.push(dependencyGraphLines.join("\n"));
		bodyContent.push("");
	}

	bodyContent.push(formatHeading(t("detail.description"), 2));
	const descriptionText = task.description?.trim();
	const descriptionContent = descriptionText
		? transformCodePaths(descriptionText)
		: `{gray-fg}${t("detail.noDescription")}{/}`;
	bodyContent.push(descriptionContent);
	bodyContent.push("");

	if (task.references?.length) {
		bodyContent.push(formatHeading(t("detail.references"), 2));
		const formattedRefs = task.references.map((ref) => {
			// Color URLs differently from file paths
			if (ref.startsWith("http://") || ref.startsWith("https://")) {
				return `  {cyan-fg}${ref}{/}`;
			}
			return `  {yellow-fg}${ref}{/}`;
		});
		bodyContent.push(formattedRefs.join("\n"));
		bodyContent.push("");
	}

	if (task.documentation?.length) {
		bodyContent.push(formatHeading(t("detail.documentation"), 2));
		const formattedDocs = task.documentation.map((doc) => {
			if (doc.startsWith("http://") || doc.startsWith("https://")) {
				return `  {cyan-fg}${doc}{/}`;
			}
			return `  {yellow-fg}${doc}{/}`;
		});
		bodyContent.push(formattedDocs.join("\n"));
		bodyContent.push("");
	}

	bodyContent.push(formatHeading(t("detail.acceptanceCriteria"), 2));
	const checklistItems = buildAcceptanceCriteriaItems(task);
	if (checklistItems.length > 0) {
		const formattedCriteria = checklistItems.map((item) =>
			formatChecklistItem(
				{
					text: transformCodePaths(item.text),
					checked: item.checked,
				},
				{
					padding: " ",
					checkedSymbol: "{green-fg}✓{/}",
					uncheckedSymbol: "{gray-fg}○{/}",
				},
			),
		);
		bodyContent.push(formattedCriteria.join("\n"));
	} else {
		bodyContent.push(`{gray-fg}${t("detail.noAcceptanceCriteria")}{/}`);
	}
	bodyContent.push("");

	bodyContent.push(formatHeading(t("detail.definitionOfDone"), 2));
	const definitionItems = buildDefinitionOfDoneItems(task);
	if (definitionItems.length > 0) {
		const formattedDefinition = definitionItems.map((item) =>
			formatChecklistItem(
				{
					text: transformCodePaths(item.text),
					checked: item.checked,
				},
				{
					padding: " ",
					checkedSymbol: "{green-fg}✓{/}",
					uncheckedSymbol: "{gray-fg}○{/}",
				},
			),
		);
		bodyContent.push(formattedDefinition.join("\n"));
	} else {
		bodyContent.push(`{gray-fg}${t("detail.noDefinitionOfDone")}{/}`);
	}
	bodyContent.push("");

	const implementationPlan = task.implementationPlan?.trim();
	if (implementationPlan) {
		bodyContent.push(formatHeading(t("detail.implementationPlan"), 2));
		bodyContent.push(transformCodePaths(implementationPlan));
		bodyContent.push("");
	}

	const implementationNotes = task.implementationNotes?.trim();
	if (implementationNotes) {
		bodyContent.push(formatHeading(t("detail.implementationNotes"), 2));
		bodyContent.push(transformCodePaths(implementationNotes));
		bodyContent.push("");
	}

	const comments = (task.comments ?? []).filter((comment) => comment.body.trim().length > 0);
	if (comments.length > 0) {
		bodyContent.push(formatHeading(t("detail.comments"), 2));
		for (const comment of comments) {
			const parts = [`#${comment.index}`];
			if (comment.author) parts.push(comment.author);
			if (comment.createdDate) parts.push(formatDateForDisplay(comment.createdDate, { dateFormat }));
			bodyContent.push(`{bold}${parts.join(" - ")}{/bold}`);
			bodyContent.push(transformCodePaths(comment.body.trim()));
			bodyContent.push("");
		}
	}

	const finalSummary = task.finalSummary?.trim();
	if (finalSummary) {
		bodyContent.push(formatHeading(t("detail.finalSummary"), 2));
		bodyContent.push(transformCodePaths(finalSummary));
		bodyContent.push("");
	}

	return { headerContent, bodyContent };
}

export async function createTaskPopup(
	screen: ScreenInterface,
	task: Task,
	resolveMilestoneLabel?: (milestone: string) => string,
	dateFormat?: string,
	configuredProjects?: string[],
	configuredPriorities?: readonly string[],
): Promise<{
	background: BoxInterface;
	popup: BoxInterface;
	contentArea: ScrollableTextInterface;
	close: () => void;
} | null> {
	if (output.isTTY === false) return null;

	const popup = box({
		parent: screen,
		top: "center",
		left: "center",
		width: "85%",
		height: "80%",
		border: "line",
		style: {
			border: { fg: "gray" },
		},
		keys: true,
		tags: true,
		autoPadding: true,
	});

	const background = box({
		parent: screen,
		top: Number(popup.top ?? 0) - 1,
		left: Number(popup.left ?? 0) - 2,
		width: Number(popup.width ?? 0) + 4,
		height: Number(popup.height ?? 0) + 2,
		style: {
			bg: "black",
		},
	});

	popup.setFront?.();

	const { headerContent, bodyContent } = generateDetailContent(task, {
		resolveMilestoneLabel,
		dateFormat,
		configuredProjects,
		configuredPriorities,
	});

	// Calculate header height based on content and available width
	const popupWidth = typeof popup.width === "number" ? popup.width : 80;
	const availableWidth = popupWidth - 6;

	let headerLineCount = 0;
	for (const headerLine of headerContent) {
		const plainText = headerLine.replace(/\{[^}]+\}/g, "");
		const lineCount = Math.max(1, Math.ceil(plainText.length / availableWidth));
		headerLineCount += lineCount;
	}

	box({
		parent: popup,
		top: 0,
		left: 1,
		right: 1,
		height: headerLineCount,
		tags: true,
		wrap: true,
		scrollable: false,
		padding: { left: 1, right: 1 },
		content: headerContent.join("\n"),
	});

	line({
		parent: popup,
		top: headerLineCount,
		left: 1,
		right: 1,
		orientation: "horizontal",
		style: { fg: "gray" },
	});

	box({
		parent: popup,
		content: " Esc ",
		top: -1,
		right: 1,
		width: 5,
		height: 1,
		style: { inverse: true, bold: true },
	});

	const contentArea = scrollabletext({
		parent: popup,
		top: headerLineCount + 1,
		left: 1,
		right: 1,
		bottom: 1,
		keys: true,
		vi: true,
		mouse: true,
		tags: true,
		wrap: true,
		padding: { left: 1, right: 1, top: 0, bottom: 0 },
		content: bodyContent.join("\n"),
		scrollbar: { ch: " ", inverse: true },
		style: { scrollbar: { bg: "gray" } },
	});

	addScrollKeys(contentArea, screen);

	const closePopup = () => {
		popup.destroy();
		background.destroy();
		screen.render();
	};

	popup.key(["escape", "q", "C-c"], () => {
		closePopup();
		return false;
	});

	contentArea.on("focus", () => {
		const popupStyle = popup.style as { border?: { fg?: string } };
		popupStyle.border = { ...(popupStyle.border ?? {}), fg: "yellow" };
		screen.render();
	});

	contentArea.on("blur", () => {
		const popupStyle = popup.style as { border?: { fg?: string } };
		popupStyle.border = { ...(popupStyle.border ?? {}), fg: "gray" };
		screen.render();
	});

	contentArea.key(["escape"], () => {
		closePopup();
		return false;
	});

	setImmediate(() => {
		contentArea.focus();
	});

	return {
		background,
		popup,
		contentArea,
		close: closePopup,
	};
}
