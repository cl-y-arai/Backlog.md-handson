import type { MessageKey } from "./en.ts";

/** Japanese CLI text, selected with BACKLOG_LANG=ja. The type requires every English key. */
export const ja: Record<MessageKey, string> = {
	"help.program": "Backlog.md - プロジェクト管理 CLI",
	"help.init":
		"現在のディレクトリ（BACKLOG_CWD が設定されていればそのディレクトリ）に backlog プロジェクトを初期化する",
	"help.search": "共有インデックスを使ってタスク・ドキュメント・決定事項を検索する",
	"help.agents": "エージェント向け指示ファイル内の Backlog.md CLI 案内文を管理する",
	"help.config": "backlog の設定を管理する",
	"help.doctor":
		"タスク・ドキュメント・決定事項の ID 重複を診断し、自己参照・循環する依存関係を報告し、重複したタスク ID を安全に修復し、アーカイブ済みタスクをアーカイブフォルダへ移動する",
	"help.cleanup": "最終ステータスのまま指定期間を過ぎたタスクをアーカイブする",
	"help.browser": "このマシンの 127.0.0.1 でのみブラウザ画面を開く（停止するには Ctrl+C または Cmd+C を押す）",
	"help.overview": "プロジェクトの統計と指標を表示する",
	"help.completion": "シェル補完スクリプトを管理する",
	"help.instructions": "Backlog.md のワークフロー手順を表示する",

	"taskList.sortedHeading": "タスク（優先度順）:",
	"taskList.noStatus": "ステータスなし",

	"status.To Do": "未着手",
	"status.In Progress": "進行中",
	"status.Done": "完了",
};
