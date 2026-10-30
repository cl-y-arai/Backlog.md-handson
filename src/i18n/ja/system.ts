import type { SystemMessages } from "../en/system.ts";

export const system: SystemMessages = {
	errorBoundary: {
		title: "問題が発生しました",
		description: "予期しないエラーが発生しました。ページを再読み込みしてください。",
		technicalDetails: "技術的な詳細",
		tryAgain: "再試行",
	},
	modal: {
		close: "モーダルを閉じる",
	},
	health: {
		serverDisconnected: "サーバーとの接続が切断されました",
		connectionRestored: "接続が復旧しました",
	},
	branchIndexing: {
		indexing: "ブランチのインデックスを作成中",
	},
	duplicateIds: {
		warningLabel: "重複したタスクID:",
		warningSummary: (groupCount: number, fileCount: number) =>
			`${groupCount} グループ（${fileCount} ファイル）。一部のタスクが表示されていない可能性があります。`,
		reviewRepair: "修復内容を確認",
		dismissWarning: "重複タスクIDの警告を閉じる",
		repairTitle: "重複したタスクIDを修復",
		repairIntro: (groupCount: number) =>
			`Backlog.md は重複ID のグループを ${groupCount} 件検出しました。修復では各グループの 1 ファイルを現在の ID のまま残し、他のファイルに新しい連番 ID を割り当てます。`,
		filesToRename: "名前を変更するファイル",
		referencesRequiringReview: (count: number) => `確認が必要な参照: ${count} 件`,
		referenceScanIncomplete: "参照のスキャンが完了していません",
		referencesNotChanged: "古い重複ID ではどのタスクを指していたか特定できないため、参照は自動では変更されません。",
		referenceScanBlocked:
			"Backlog.md がすべての Markdown ファイルを検査できなかったため、以下の失敗が解消されるまで自動修復はできません。",
		repairBlocked: "自動修復はブロックされています",
		confirmRepair: "修復の確認",
		confirmRenameQuestion: (count: number) =>
			`${count} 件のタスクファイルの名前を今すぐ変更しますか？タスクの内容は保持され、選択した各ファイル名とフロントマターの ID のみが変更されます。`,
		continue: "続行",
		repairing: "修復中…",
		repairFiles: (count: number) => `${count} 件のファイルを修復`,
		repairFailed: "重複タスクIDの修復に失敗しました。",
	},
};
