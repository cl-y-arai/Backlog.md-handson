import type { DraftsMessages } from "../en/drafts.ts";

export const drafts: DraftsMessages = {
	loading: "下書きを読み込み中...",
	errorPrefix: "エラー:",
	loadFailed: "下書きの読み込みに失敗しました",
	promoteFailed: "下書きの昇格に失敗しました",
	title: "下書きタスク",
	draftCount: (count: number) => `${count} 件の下書き`,
	newDraft: "+ 新規下書き",
	emptyTitle: "下書きはありません",
	emptyHint: "下書きタスクは、メインのバックログに昇格するまでここに表示されます。",
	createdPrefix: "作成:",
	updatedPrefix: "更新:",
	assignedTo: "担当者:",
	promoteToTask: "タスクに昇格",
};
