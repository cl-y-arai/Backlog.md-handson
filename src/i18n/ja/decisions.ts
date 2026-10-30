import type { DecisionsMessages } from "../en/decisions.ts";

export const decisions: DecisionsMessages = {
	editorPlaceholder: "ここに意思決定の内容を書いてください...",
	saveFailedFallback: "意思決定の保存に失敗しました。",
	noneSelectedTitle: "意思決定が選択されていません",
	noneSelectedHint: "サイドバーから意思決定を選択すると内容が表示されます。",
	titlePlaceholder: "意思決定のタイトル",
	fallbackTitle: (id: string) => `意思決定 ${id}`,
	typeLabel: "意思決定",
	dateLabel: "日付:",
	statusLabels: {
		proposed: "提案中",
		accepted: "承認済み",
		rejected: "却下",
		superseded: "置き換え済み",
	},
	savedToast: (title: string) => `意思決定「${title}」を保存しました`,
	archiveNoun: "意思決定",
};
