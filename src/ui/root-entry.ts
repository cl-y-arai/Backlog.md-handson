import { renderConfiguredTaskIds } from "../commands/help-schema.ts";
import { t } from "../i18n/index.ts";
import { INSTRUCTION_GUIDES } from "../mcp/workflow-guides.ts";

type RootEntryOptions = {
	version: string;
	initialized: boolean;
	color?: boolean;
};

const ANSI = {
	reset: "\u001B[0m",
	logo: "\u001B[1;36m",
	title: "\u001B[1m",
	section: "\u001B[1;33m",
} as const;

const LOGO_LINES = [
	"██████╗  █████╗  █████╗ ██╗  ██╗██╗      █████╗  ██████╗    ███╗   ███╗██████╗ ",
	"██╔══██╗██╔══██╗██╔══██╗██║ ██╔╝██║     ██╔══██╗██╔════╝    ████╗ ████║██╔══██╗",
	"██████╦╝███████║██║  ╚═╝█████═╝ ██║     ██║  ██║██║  ██╗    ██╔████╔██║██║  ██║",
	"██╔══██╗██╔══██║██║  ██╗██╔═██╗ ██║     ██║  ██║██║  ╚██╗   ██║╚██╔╝██║██║  ██║",
	"██████╦╝██║  ██║╚█████╔╝██║ ╚██╗███████╗╚█████╔╝╚██████╔╝██╗██║ ╚═╝ ██║██████╔╝",
	"╚═════╝ ╚═╝  ╚═╝ ╚════╝ ╚═╝  ╚═╝╚══════╝ ╚════╝  ╚═════╝ ╚═╝╚═╝     ╚═╝╚═════╝ ",
];

function commandLine(command: string, description: string): string {
	return `  ${command.padEnd(46)} ${description}`;
}

function colorize(value: string, code: string, enabled: boolean): string {
	return enabled ? `${code}${value}${ANSI.reset}` : value;
}

function sectionTitle(value: string, color: boolean): string {
	return colorize(value, ANSI.section, color);
}

export function formatRootEntry({ version, initialized, color = false }: RootEntryOptions): string {
	const logoLines = LOGO_LINES.map((line) => colorize(line, ANSI.logo, color));
	const lines: string[] = [...logoLines, "", `${colorize("Backlog.md", ANSI.title, color)} v${version}`, ""];

	if (!initialized) {
		lines.push(t("root.notInitialized"), "");
		lines.push(sectionTitle(t("root.projectSetup"), color));
		lines.push(commandLine("backlog init", t("root.initInteractive")));
		lines.push(commandLine("backlog init --defaults", t("root.initDefaults")));
		lines.push(commandLine("backlog init --no-git", t("root.initNoGit")));
		lines.push("");
	} else {
		lines.push(sectionTitle(t("root.commonWorkflow"), color));
		lines.push(commandLine('backlog search "query" --plain', t("root.search")));
		lines.push(commandLine("backlog task list --plain", t("root.listTasks")));
		lines.push(commandLine(renderConfiguredTaskIds("backlog task view {{TASK_ID:123}} --plain"), t("root.readTask")));
		lines.push(commandLine('backlog task create "Title" -d "Description"', t("root.createTask")));
		lines.push(commandLine("backlog board", t("root.board")));
		lines.push(commandLine("backlog browser", t("root.browser")));
		lines.push("");
	}

	lines.push(sectionTitle(t("root.localInstructions"), color));
	lines.push(commandLine("backlog instructions", t("root.listGuides")));
	for (const guide of INSTRUCTION_GUIDES) {
		lines.push(commandLine(`backlog instructions ${guide.key}`, guide.description));
	}
	lines.push("");

	lines.push(sectionTitle(t("root.commandHelp"), color));
	lines.push(commandLine("backlog <command> --help", t("root.helpDetail")));
	lines.push("");
	lines.push(t("root.docs", { url: "https://backlog.md" }));
	lines.push("");

	return `${lines.join("\n")}\n`;
}

export async function printRootEntry(options: RootEntryOptions): Promise<void> {
	const color = options.color ?? (Boolean(process.stdout.isTTY) && !process.env.NO_COLOR);
	process.stdout.write(formatRootEntry({ ...options, color }));
}
