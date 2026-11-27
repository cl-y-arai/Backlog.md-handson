# Backlog.md の Web UI をソースのまま動かすコンテナ（Cloudflare Containers 用）
FROM oven/bun:1.4.4

# git: Backlog.md がタスクの状態をブランチから読むのに使う
# socat: 127.0.0.1 でしか待ち受けない Web UI を、コンテナの外から届く 8080 番に中継する
RUN apt-get update \
	&& apt-get install -y --no-install-recommends git socat ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .
RUN git config --global --add safe.directory /app

# husky の prepare（git フックの設定）はコンテナでは不要なので --ignore-scripts
RUN bun install --frozen-lockfile --ignore-scripts

# コンテナからは git fetch しない（外部への通信を前提にしない）
RUN sed -i 's/^remote_operations: true/remote_operations: false/' backlog/config.yml

EXPOSE 8080
CMD ["sh", "-c", "bun src/cli.ts browser --no-open --port 6420 & exec socat TCP-LISTEN:8080,fork,reuseaddr TCP:127.0.0.1:6420"]
