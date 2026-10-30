import type { Messages } from "./en.ts";

export const ja: Messages = {
	common: {
		loading: "読み込み中...",
		poweredBy: "提供:",
		retry: "再試行",
		language: "言語",
	},
	theme: {
		switchToDark: "ダークモードに切り替え",
		switchToLight: "ライトモードに切り替え",
	},
	nav: {
		searchPlaceholder: "検索 (⌘K)...",
		searchTitle: "検索 (⌘K)",
		searchResults: "検索結果",
		searching: "検索中…",
		loadingContent: "コンテンツを読み込み中",
		loadFailed: "ナビゲーションの読み込みに失敗しました",
		loadFailedRetry: "ナビゲーションの読み込みに失敗しました。再試行",
		expandSidebar: "サイドバーを開く",
		collapseSidebar: "サイドバーを閉じる",
		tasks: "タスク",
		kanbanBoard: "カンバンボード",
		allTasks: "すべてのタスク",
		milestones: "マイルストーン",
		drafts: "下書き",
		statistics: "統計",
		documents: "ドキュメント",
		documentsUnavailable: "ドキュメントを取得できません",
		noDocuments: "ドキュメントなし",
		createDocument: "新しいドキュメントを作成",
		decisions: "決定事項",
		decisionsUnavailable: "決定事項を取得できません",
		noDecisions: "決定事項なし",
		settings: "設定",
		loadingCount: "{label}の件数を読み込み中",
		countUnavailable: "{label}の件数を取得できません",
		countLabel: { task: "タスク", document: "ドキュメント", decision: "決定事項" },
	},
	board: {
		title: "カンバンボード",
		failedToLoad: "タスクの読み込みに失敗しました",
	},
	taskList: {
		title: "すべてのタスク",
	},
};
