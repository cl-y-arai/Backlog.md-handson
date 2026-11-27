import type { ScreenInterface } from "neo-neo-bblessed";
import { box } from "neo-neo-bblessed";
import { t } from "../../i18n/index.ts";
import { footerLine, keyHint } from "../footer-content.ts";
import { createPopupChrome } from "./filter-popup.ts";

export async function openConfirmPopup(options: {
	screen: ScreenInterface;
	title: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
}): Promise<boolean> {
	return new Promise<boolean>((resolve) => {
		let settled = false;
		const { popup, close } = createPopupChrome({
			screen: options.screen,
			title: options.title,
			helpText: footerLine(keyHint("Enter/y", t("key.yes")), keyHint("Esc/n", t("key.no"))),
			width: 40,
			height: 10,
		});

		const content = box({
			parent: popup,
			top: "center",
			left: 1,
			right: 1,
			height: 3,
			align: "center",
			content: options.message,
			tags: true,
		});

		const finish = (value: boolean) => {
			if (settled) return;
			settled = true;
			content.destroy();
			close();
			options.screen.render();
			resolve(value);
		};

		popup.key(["escape", "n", "N"], () => {
			finish(false);
			return false;
		});

		popup.key(["enter", "y", "Y"], () => {
			finish(true);
			return false;
		});

		setImmediate(() => {
			popup.focus();
			options.screen.render();
		});
	});
}
