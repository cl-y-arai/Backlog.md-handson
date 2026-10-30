import type { DocumentsMessages } from "../en/documents.ts";

export const documents: DocumentsMessages = {
	editorPlaceholder: "ここにドキュメントを書いてください...",
	notFound: (id: string) => `ID「${id}」のドキュメントが見つかりません`,
	loadFailed: "ドキュメントの読み込みに失敗しました",
	titleRequired: "ドキュメントのタイトルは必須です",
	saveFailedFallback: "ドキュメントの保存に失敗しました",
	noneSelectedTitle: "ドキュメントが選択されていません",
	noneSelectedHint: "サイドバーからドキュメントを選択すると内容が表示されます。",
	titlePlaceholder: "ドキュメントのタイトル",
	fallbackTitle: (id: string) => `ドキュメント ${id}`,
	typeLabel: "ドキュメント",
	createdLabel: "作成日:",
	saveFailed: (message: string) => `保存に失敗しました: ${message}`,
	savedToast: (title: string) => `ドキュメント「${title}」を保存しました`,
	archiveNoun: "ドキュメント",
	recordArchive: {
		archivedLabel: "アーカイブ済み",
		confirm: (title: string, restoreCommand: string) =>
			`「${title}」をアーカイブしますか？サイドバーと検索に表示されなくなります。CLI から次のコマンドで復元できます: ${restoreCommand}`,
		commitFailed: (noun: string) =>
			`${noun}はアーカイブされましたが、変更のコミットに失敗しました。再試行する前にリポジトリを確認してください。`,
	},
};
