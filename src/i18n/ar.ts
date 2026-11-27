import type { MessageKey } from "./en.ts";

/** Arabic CLI copy. Typed against the English keys so a missing translation fails the type check. */
export const ar: Record<MessageKey, string> = {
	"program.description": "Backlog.md - أداة سطر أوامر لإدارة المشاريع",

	"command.init": "تهيئة مشروع backlog في المجلد الحالي (أو في BACKLOG_CWD عند تعيينه)",
	"command.search": "البحث في المهام والمستندات والقرارات باستخدام الفهرس المشترك",
	"command.board": "عرض المهام في لوحة كانبان",
	"command.agents": "إدارة التنبيه المختصر لسطر أوامر Backlog.md في ملفات تعليمات الوكلاء",
	"command.config": "إدارة إعدادات backlog",
	"command.doctor":
		"تشخيص معرّفات المهام والمستندات والقرارات المكررة، والإبلاغ عن التبعيات الذاتية والدائرية، وإصلاح معرّفات المهام المكررة بأمان، ونقل المهام المؤرشفة إلى مجلد الأرشيف",
	"command.cleanup": "أرشفة المهام في الحالة النهائية التي يتجاوز عمرها المدة المحددة",
	"command.browser": "فتح واجهة المتصفح على هذا الجهاز فقط عبر 127.0.0.1 (اضغط Ctrl+C أو Cmd+C للإيقاف)",
	"command.overview": "عرض إحصاءات المشروع ومقاييسه",
	"command.completion": "إدارة نصوص الإكمال التلقائي للصدفة",
	"command.instructions": "عرض تعليمات سير عمل Backlog.md",

	"taskList.sortedHeading": "المهام (مرتبة حسب الأولوية):",
	"taskList.noStatus": "بدون حالة",
	"taskList.noTasks": "لم يتم العثور على مهام.",
	"taskList.noChildTasks": "لم يتم العثور على مهام فرعية للمهمة الأصلية {parentId}.",

	"tui.tasks": "المهام",
	"tui.tasksPane": "المهام ({count})",
	"tui.detailsPane": "التفاصيل",

	"status.To Do": "قيد الانتظار",
	"status.In Progress": "قيد التنفيذ",
	"status.Done": "مكتملة",
};
