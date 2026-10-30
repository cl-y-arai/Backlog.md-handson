import { defineMessages } from "../define-messages.ts";

export const task = defineMessages({
	en: {
		// Modal frame
		closeModal: "Close modal",
		createNewTask: "Create New Task",
		createNewDraft: "Create New Draft",
		create: "Create",
		savingEllipsis: "Saving…",
		add: "Add",
		remove: "Remove",
		removeItem: "Remove {item}",

		// Unsaved changes and validation
		discardChanges: "Discard unsaved changes?",
		discardChangesAndClose: "Discard unsaved changes and close?",
		discardChangesAndLeave: "Discard unsaved changes and leave this task?",
		titleRequired: "Title is required",
		failedToSave: "Failed to save task",
		commentBodyDelimiter: "Comment body cannot contain standalone '---' delimiter lines.",
		commentAuthorDelimiter: "Comment author cannot contain standalone '---' delimiter lines.",

		// Demote and archive
		moveToDrafts: "Move task to drafts",
		demote: "Demote",
		demoteToDraft: "Demote to draft",
		demoting: "Demoting…",
		demoteConfirm: 'Demote "{title}" to draft? It will be moved to the drafts folder.',
		demoteRefreshFailed:
			"The task was moved to drafts, but refreshing the view failed. Close this dialog and verify the draft before retrying.",
		demoteCleanupFailed:
			"The task was moved to drafts, but removing references from dependent tasks failed. Some dependent tasks may still reference it. The view was refreshed; check those tasks before retrying.",
		demoteCommitFailed:
			"The task was moved to drafts, but recording the Git commit failed. The view was refreshed; verify the draft before retrying.",
		demoteLaterStepFailed:
			"The task was moved to drafts, but a later step failed. The view was refreshed; verify the draft and dependent tasks before retrying.",
		demoteFilesystemFailed:
			"The demotion encountered a filesystem failure and may have left both task and draft copies. The view was refreshed; inspect them before retrying.",
		demoteResponseLost:
			"The demotion request may have succeeded, but its response was lost. Check the task and drafts views before retrying.",
		archiveConfirm: 'Archive "{title}"? It moves off the board. Its ID, record, dependencies, and references are kept.',
		archiveTaskTitle: "Move this task off the board into the archive",
		archiveTask: "Archive Task",

		// Read-only banner
		readOnly: "Read-only:",
		readOnlyBranchBefore: "This task exists in the ",
		readOnlyBranchAfter: " branch. Switch to that branch to edit it.",
		readOnlyArchived: "This task is archived.",

		// Hierarchy
		taskHierarchy: "Task hierarchy",
		parent: "Parent",
		openParentTask: "Open parent task {id}: {title} ({status})",
		subtasks: "Subtasks",
		subtaskProgress: "{completed} of {total} complete",
		openSubtask: "Open subtask {id}: {title} ({status})",

		// Main sections
		title: "Title",
		titlePlaceholder: "Enter task title",
		description: "Description",
		noDescription: "No description",
		references: "References",
		noReferences: "No references",
		removeReference: "Remove reference",
		referencePlaceholder: "URL or file path...",
		modifiedFiles: "Modified files",
		noModifiedFiles: "No modified files",
		removeModifiedFile: "Remove modified file",
		modifiedFilePlaceholder: "Path from project root...",
		documentation: "Documentation",
		acceptanceCriteria: "Acceptance Criteria",
		noAcceptanceCriteria: "No acceptance criteria",
		newCriterion: "New criterion",
		toggleToUpdate: "Toggle to update",
		definitionOfDone: "Definition of Done",
		noDefinitionOfDone: "No Definition of Done items",
		dependencyGraph: "Dependency Graph",
		implementationPlan: "Implementation Plan",
		noPlan: "No plan",
		implementationNotes: "Implementation Notes",
		noNotes: "No notes",
		comments: "Comments",
		noComments: "No comments",
		commentAuthorPlaceholder: "Author",
		commentBodyPlaceholder: "Add a comment...",
		addingComment: "Adding...",
		addComment: "Add comment",
		finalSummary: "Final Summary",
		completionSummary: "Completion summary",
		finalSummaryPlaceholder: "PR-style summary of what was implemented (write when task is complete)",

		// Sidebar
		createdLabel: "Created:",
		updatedLabel: "Updated:",
		dueLabel: "Due:",
		due: "Due",
		status: "Status",
		type: "Type",
		taskType: "Task type",
		noType: "No type",
		notConfigured: "{value} (not configured)",
		assignee: "Assignee",
		assigneePlaceholder: "Type name and press Enter",
		labels: "Labels",
		labelsPlaceholder: "Type label and press Enter or comma",
		priority: "Priority",
		noPriority: "No Priority",
		project: "Project",
		taskProject: "Task project",
		noProject: "No Project",
		milestone: "Milestone",
		noMilestone: "No milestone",
		dependencies: "Dependencies",
		readyToStart: "Ready to start",
		blockedBy: "Blocked by {ids}",
		unknownDependencyOne: "Unknown dependency {ids}",
		unknownDependencyOther: "Unknown dependencies {ids}",

		// Dependency input
		dependencyPlaceholderEmpty: "Type task ID or title, then press Enter or comma",
		dependencyPlaceholderMore: "Add more dependencies...",

		// Dependency graph
		dependsOn: "Depends on",
		dependents: "Dependents",
		unknownId: "Unknown ID",
		ambiguousId: "Ambiguous ID",
		completed: "Completed",
		cycle: "Cycle",
		shownAbove: "Shown above",
		openNode: "Open {label}",
		graphDirectTotal: "{direct} direct, {total} total",

		// Relative dates
		today: "today",
		yesterday: "yesterday",
		daysAgo: "{days}d ago",
	},
	ja: {
		// Modal frame
		closeModal: "モーダルを閉じる",
		createNewTask: "新しいタスクを作成",
		createNewDraft: "新しい下書きを作成",
		create: "作成",
		savingEllipsis: "保存中…",
		add: "追加",
		remove: "削除",
		removeItem: "{item} を削除",

		// Unsaved changes and validation
		discardChanges: "保存されていない変更を破棄しますか？",
		discardChangesAndClose: "保存されていない変更を破棄して閉じますか？",
		discardChangesAndLeave: "保存されていない変更を破棄してこのタスクから移動しますか？",
		titleRequired: "タイトルは必須です",
		failedToSave: "タスクの保存に失敗しました",
		commentBodyDelimiter: "コメント本文に単独の '---' 区切り行を含めることはできません。",
		commentAuthorDelimiter: "コメントの作成者に単独の '---' 区切り行を含めることはできません。",

		// Demote and archive
		moveToDrafts: "タスクを下書きに移動",
		demote: "下書きへ",
		demoteToDraft: "下書きに戻す",
		demoting: "下書きに戻しています…",
		demoteConfirm: "「{title}」を下書きに戻しますか？drafts フォルダーに移動されます。",
		demoteRefreshFailed:
			"タスクは下書きに移動しましたが、表示の更新に失敗しました。このダイアログを閉じ、再試行する前に下書きを確認してください。",
		demoteCleanupFailed:
			"タスクは下書きに移動しましたが、依存タスクからの参照の削除に失敗しました。一部の依存タスクがまだ参照している可能性があります。表示は更新済みです。再試行する前にそれらのタスクを確認してください。",
		demoteCommitFailed:
			"タスクは下書きに移動しましたが、Git コミットの記録に失敗しました。表示は更新済みです。再試行する前に下書きを確認してください。",
		demoteLaterStepFailed:
			"タスクは下書きに移動しましたが、後続の処理に失敗しました。表示は更新済みです。再試行する前に下書きと依存タスクを確認してください。",
		demoteFilesystemFailed:
			"下書きへの移動中にファイルシステムのエラーが発生し、タスクと下書きの両方のコピーが残っている可能性があります。表示は更新済みです。再試行する前に確認してください。",
		demoteResponseLost:
			"下書きへの移動は成功した可能性がありますが、応答が失われました。再試行する前にタスクと下書きの画面を確認してください。",
		archiveConfirm: "「{title}」をアーカイブしますか？ボードから外れます。ID、記録、依存関係、参照は保持されます。",
		archiveTaskTitle: "このタスクをボードから外してアーカイブに移動",
		archiveTask: "タスクをアーカイブ",

		// Read-only banner
		readOnly: "読み取り専用：",
		readOnlyBranchBefore: "このタスクは ",
		readOnlyBranchAfter: " ブランチにあります。編集するにはそのブランチに切り替えてください。",
		readOnlyArchived: "このタスクはアーカイブされています。",

		// Hierarchy
		taskHierarchy: "タスク階層",
		parent: "親タスク",
		openParentTask: "親タスク {id}: {title}（{status}）を開く",
		subtasks: "サブタスク",
		subtaskProgress: "{total} 件中 {completed} 件完了",
		openSubtask: "サブタスク {id}: {title}（{status}）を開く",

		// Main sections
		title: "タイトル",
		titlePlaceholder: "タスクのタイトルを入力",
		description: "説明",
		noDescription: "説明はありません",
		references: "参照",
		noReferences: "参照はありません",
		removeReference: "参照を削除",
		referencePlaceholder: "URL またはファイルパス...",
		modifiedFiles: "変更されたファイル",
		noModifiedFiles: "変更されたファイルはありません",
		removeModifiedFile: "変更されたファイルを削除",
		modifiedFilePlaceholder: "プロジェクトルートからのパス...",
		documentation: "ドキュメント",
		acceptanceCriteria: "受け入れ基準",
		noAcceptanceCriteria: "受け入れ基準はありません",
		newCriterion: "新しい基準",
		toggleToUpdate: "チェックで更新",
		definitionOfDone: "完了の定義",
		noDefinitionOfDone: "完了の定義の項目はありません",
		dependencyGraph: "依存関係グラフ",
		implementationPlan: "実装計画",
		noPlan: "計画はありません",
		implementationNotes: "実装メモ",
		noNotes: "メモはありません",
		comments: "コメント",
		noComments: "コメントはありません",
		commentAuthorPlaceholder: "作成者",
		commentBodyPlaceholder: "コメントを追加...",
		addingComment: "追加中...",
		addComment: "コメントを追加",
		finalSummary: "最終サマリー",
		completionSummary: "完了時のまとめ",
		finalSummaryPlaceholder: "実装内容の PR 形式のまとめ（タスク完了時に記入）",

		// Sidebar
		createdLabel: "作成日：",
		updatedLabel: "更新日：",
		dueLabel: "期限：",
		due: "期限",
		status: "ステータス",
		type: "種類",
		taskType: "タスクの種類",
		noType: "種類なし",
		notConfigured: "{value}（未設定）",
		assignee: "担当者",
		assigneePlaceholder: "名前を入力して Enter",
		labels: "ラベル",
		labelsPlaceholder: "ラベルを入力して Enter またはカンマ",
		priority: "優先度",
		noPriority: "優先度なし",
		project: "プロジェクト",
		taskProject: "タスクのプロジェクト",
		noProject: "プロジェクトなし",
		milestone: "マイルストーン",
		noMilestone: "マイルストーンなし",
		dependencies: "依存関係",
		readyToStart: "着手可能",
		blockedBy: "{ids} によりブロック中",
		unknownDependencyOne: "不明な依存関係 {ids}",
		unknownDependencyOther: "不明な依存関係 {ids}",

		// Dependency input
		dependencyPlaceholderEmpty: "タスク ID またはタイトルを入力し、Enter またはカンマで追加",
		dependencyPlaceholderMore: "依存関係をさらに追加...",

		// Dependency graph
		dependsOn: "依存先",
		dependents: "依存元",
		unknownId: "不明な ID",
		ambiguousId: "曖昧な ID",
		completed: "完了",
		cycle: "循環",
		shownAbove: "上に表示済み",
		openNode: "{label} を開く",
		graphDirectTotal: "直接 {direct} 件、合計 {total} 件",

		// Relative dates
		today: "今日",
		yesterday: "昨日",
		daysAgo: "{days}日前",
	},
});
