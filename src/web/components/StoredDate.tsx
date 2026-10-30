import type React from "react";
import { useTranslation } from "../contexts/LanguageContext";
import { formatStoredDateForCompactDisplay, formatStoredDateForDisplay } from "../utils/date-display";

interface StoredDateProps {
	value?: string;
	dateFormat?: string;
	/** Dense lists render recent values relatively ("today", "3d ago"). */
	compact?: boolean;
	className?: string;
}

/**
 * Renders a stored UTC date as local time with the canonical UTC value on hover.
 * Every web surface showing a stored date goes through this, so no component converts on its own.
 */
const StoredDate: React.FC<StoredDateProps> = ({ value, dateFormat, compact = false, className }) => {
	const { t } = useTranslation();
	const labels = {
		today: t("app.date.today"),
		yesterday: t("app.date.yesterday"),
		daysAgo: (days: number) => t("app.date.daysAgo", { days }),
	};
	const { text, title } = compact
		? formatStoredDateForCompactDisplay(value, { dateFormat, labels })
		: formatStoredDateForDisplay(value, { dateFormat });

	return (
		<span className={className} title={title}>
			{text}
		</span>
	);
};

export default StoredDate;
