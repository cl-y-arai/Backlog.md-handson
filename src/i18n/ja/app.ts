import type { AppMessages } from "../en/app.ts";

export const app: AppMessages = {
	loading: "読み込み中",
	documentTitle: (projectName: string) => `${projectName} - タスク管理`,
	loadDataFailed: "データの読み込みに失敗しました",
	archiveCommitFailed:
		"タスクはアーカイブされましたが、変更のコミットに失敗しました。再試行する前にリポジトリを確認してください。",
	taskCreated: (isDraft: boolean, title: string, id: string) =>
		`${isDraft ? "下書き" : "タスク"}「${title}」を作成しました（${id}）`,
	taskRoute: {
		invalidLink: "このタスクのリンクは無効です。",
		invalidTaskId: (taskId: string) => `「${taskId}」は有効なタスクIDではありません。`,
		ambiguous: (taskId: string) =>
			`タスク「${taskId}」は特定できません。このリンクを開く前に重複したタスクIDを修復してください。`,
		notFound: (taskId: string) => `タスク「${taskId}」が見つかりませんでした。`,
		openFailed: (taskId: string) => `タスク「${taskId}」を開けませんでした。もう一度お試しください。`,
	},
};
