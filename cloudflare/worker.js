// Cloudflare Workers の入口。受けたリクエストをすべて Backlog.md のコンテナに転送する。
// 依存パッケージを増やさないよう、Workers 組み込みの Container API（this.ctx.container）だけを使う。
import { DurableObject } from "cloudflare:workers";

// コンテナ内で socat が待ち受けるポート（Dockerfile の EXPOSE と合わせる）
const PORT = 8080;
// この時間アクセスが無ければコンテナを止める
const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000;
// 起動を待つ上限（200ms × 150回 = 30秒）
const READY_RETRIES = 150;
const READY_INTERVAL_MS = 200;

export class BacklogContainer extends DurableObject {
	/** @type {Promise<void> | null} */
	#ready = null;

	async fetch(request) {
		await this.#ensureReady();
		const url = new URL(request.url);
		url.protocol = "http:";
		url.host = "container";
		const forwarded = new Request(url, request);
		forwarded.headers.delete("host");
		return this.ctx.container.getTcpPort(PORT).fetch(forwarded);
	}

	// コンテナが止まっていれば起動し、Web UI が応答するまで待つ。同時に来たリクエストは同じ待ちを共有する
	#ensureReady() {
		const container = this.ctx.container;
		if (!container.running) this.#ready = null;
		if (!this.#ready) {
			this.#ready = (async () => {
				if (!container.running) container.start();
				await container.setInactivityTimeout(INACTIVITY_TIMEOUT_MS);
				const port = container.getTcpPort(PORT);
				for (let i = 0; i < READY_RETRIES; i++) {
					try {
						await port.fetch("http://container/");
						return;
					} catch {
						await scheduler.wait(READY_INTERVAL_MS);
					}
				}
				throw new Error(`Container did not become ready on port ${PORT}`);
			})();
			this.#ready.catch(() => {
				this.#ready = null;
			});
		}
		return this.#ready;
	}
}

export default {
	async fetch(request, env) {
		// 全員が同じ1台のコンテナを見る
		return env.BACKLOG.getByName("main").fetch(request);
	},
};
