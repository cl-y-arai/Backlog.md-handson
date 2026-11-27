import type { MessageKey } from "./en.ts";

/** Japanese CLI copy. Typed against the English keys so a missing translation fails the type check. */
export const ja: Record<MessageKey, string> = {
	"program.description": "Backlog.md - プロジェクト管理 CLI",

	"command.init":
		"現在のディレクトリ（BACKLOG_CWD が設定されている場合はそのディレクトリ）に Backlog プロジェクトを初期化する",
	"command.search": "共有インデックスを使ってタスク、ドキュメント、決定事項を検索する",
	"command.board": "タスクをカンバンボードで表示する",
	"command.agents": "エージェント指示ファイル内の短い Backlog.md CLI 案内文を管理する",
	"command.config": "Backlog の設定を管理する",
	"command.doctor":
		"重複したタスク・ドキュメント・決定事項の ID を診断し、自己参照や循環する依存関係を報告し、重複したタスク ID を安全に修復し、アーカイブ済みタスクをアーカイブフォルダーへ移動する",
	"command.cleanup": "最終ステータスにあり、指定した期間より古いタスクをアーカイブする",
	"command.browser": "このマシン上でのみ 127.0.0.1 でブラウザー画面を開く（停止するには Ctrl+C または Cmd+C を押す）",
	"command.overview": "プロジェクトの統計とメトリクスを表示する",
	"command.completion": "シェル補完スクリプトを管理する",
	"command.instructions": "Backlog.md のワークフロー手順を表示する",

	"taskList.sortedHeading": "タスク（優先度順）:",
	"taskList.noStatus": "ステータスなし",
	"taskList.noTasks": "タスクが見つかりません。",
	"taskList.noChildTasks": "親タスク {parentId} の子タスクが見つかりません。",

	"tui.tasks": "タスク",
	"tui.tasksPane": "タスク ({count})",
	"tui.detailsPane": "詳細",

	"status.To Do": "未着手",
	"status.In Progress": "進行中",
	"status.Done": "完了",
};
