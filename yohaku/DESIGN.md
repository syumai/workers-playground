# 余白（Yohaku）設計

個人のクリッピング机。読んだ URL やメモを机に置き、要約・類似・週次の便りまでが一続きになる。実装はこの文書の合意後。本文は設計のみ。

調査時点: 2026-10-24。`workers-go` の `main` は `a38be30753a413b075ec7344faa6a26acb436d42`（2026-09-24、PR #237）。生成バインディングの元は `@cloudflare/workers-types@5.20260906.1`（`exp/cloudflare.WorkersTypesVersion`）。

## 置き場所

`syumai/workers-playground` のトップレベルに `yohaku/` を置く。

このリポジトリの決まりは「実験 1 つ = リポジトリ直下のディレクトリ」。Go の例（`go-html-template`、`worker-go-template`）は `Makefile` + `wrangler.toml`（または `wrangler.jsonc`）+ `go.mod` + `README`、ビルドは `workers-assets-gen` と `GOOS=js GOARCH=wasm`。`docs/` は無い。設計文書は将来の実装と同じ `yohaku/DESIGN.md` に置き、コードを足すときもこのディレクトリに閉じる。

他候補は今回の家にしない。

| リポジトリ | 見えているもの | 判断 |
| --- | --- | --- |
| [syumai/workers-playground](https://github.com/syumai/workers-playground) | Workers 向けの実験が並ぶ。Wrangler、Go / TinyGo、Hono、Queues、R2 の先例がある | 採用 |
| [syumai/go-wasm-playground](https://github.com/syumai/go-wasm-playground) | ブラウザ Wasm の小例（TimeFormatter、Classify）。最終更新 2025-06。Workers の binding も Wrangler も無い | Workers の机を置く場所ではない |
| [syumai/go-playground](https://github.com/syumai/go-playground) | `writer/` だけの空に近いリポジトリ。最終 push は 2019-01 | 同上 |

## サービス案

三つとも「`exp/` の API を画面に並べる」形にはしない。ユーザーが繰り返す仕事の中に各 API を埋め込む。

1. **余白（採用）。** 自分用のクリッピング机。URL や短い文章を置くと、本文と画像が残り、要約と似たクリップが返り、週に一度便りが届く。開いている下書きは机の上で同期する。
2. **卓。** 部屋ごとの掲示板。Durable Object の部屋、投稿、画像、リアルタイムにはよく合う。受信メールと Deno 側の定期実行が「掲示板を使う」理由になりにくい。
3. **点検票。** 自分の Worker の様子を見る画面。tail、Analytics Engine、version metadata は自然。要約、画像、ベクトル検索、メールを監視の主目的に結びつけるのが難しい。

余白を採る。保存、非同期処理、要約、類似、開いたままの机、定期の便り、メールでの取り込みが、それぞれクリップを残す・見つける・届けるという一つの目的に対応する。利用者はオーナー本人の一台の机（マルチユーザーのアカウント基盤は `exp/` に無い）。

トップページはクリップの机そのもの。デモ一覧にはしない。任意 binding の有無、Worker の版、直近の tail、Deno 側の健康は `/admin`（この机の裏側）にまとめる。

## ランタイムの形

ブロックする Go の入口はプロセスにつき一つ。本体の入口は `hono.ServeMiddleware`。Durable Object、Workflow、RPC、Queue consumer の登録は、その前に行う。`workers.Serve` は使わない。`_examples` が `workers.Serve` でやっている「登録してから一つだけブロックする」を、Hono ミドルウェアのブロックに置き換える。実装時に Workflow / DO のトリガーでこの置換が同じように動くことを、各 `_examples` と突き合わせて確認する。

`email.Handle` と `tail.Handle` は、登録とブロックが分かれていない（`a38be307` 時点。Queue の `ConsumeNonBlock` に相当する公開関数が無い）。Tail Worker は別スクリプトである必要もある。受信メールも別 Worker にして、それぞれの `Handle` をそのプロセスの入口にする。本体は送信 binding だけを使う。

```text
利用者
  │  HTTPS / WebSocket
  ▼
yohaku            Hono（JS）が経路、Go ミドルウェア、RPC、Queue 生産、DO、Workflow、送信メール
  │  tail_consumers          │ Service binding          │ HTTPS（ダイジェストの起動）
  ▼                          ▼                          ▼
yohaku-tail            yohaku-inbox                 yohaku-capture（Deno）
trace を机の KV へ      届いたメールをクリップ化      手元の取り込みと週次の起動
```

| プロセス | 入口 | 置くもの |
| --- | --- | --- |
| `yohaku` | `hono.ServeMiddleware` | 机の HTTP、プレビュー用 WebSocket、Desk DO、PublishClip Workflow、ClipService RPC、Queue の生産と消費、Cache、AI、KV、R2、Vectorize、Analytics、Rate Limit、Images、version metadata。任意で Hyperdrive と Dispatch |
| `yohaku-inbox` | `email.Handle` | 受信メールを RPC `create` で机に渡す。受領の返信 |
| `yohaku-tail` | `tail.Handle` | 本体の trace を KV の「直近の様子」に書く。`/admin` が読む |
| `yohaku-capture` | `deno.OnCron` + `Deno.serve` | 手元または Deno Deploy の取り込み箱。週次で本体のダイジェストを起動する |

Hono の実体は JS 側に残る（`exp/hono` はミドルウェア専用）。Wrangler の `main` は生成された `build/worker.mjs` の `fetch` をそのまま使わない。生成物は `handleRequest` を呼ぶが、本体は `workers.Serve` を起動しないためである。

`js/index.mjs` がやること:

- `build/core.mjs` の `run` と `build/runtime.mjs` の `createRuntimeContext` で、リクエストごとに Wasm を起こす（`worker.mjs` の `fetch` と同じ起こし方）。
- Hono の先頭ミドルウェアで `binding.runHonoMiddleware(next)` を呼ぶ。
- 経路ハンドラは Service binding 経由で `ClipService` の RPC を呼ぶ。ドメインの処理は Go 側に置く。
- `queue` と、生成された Durable Object / Workflow / `WorkerEntrypoint` クラスは `build/worker.mjs` から再エクスポートする。

`workers-assets-gen` の生成クラス名、`durableobjects.Register` / `workflows.Register` / `rpc.Register` の名前、Wrangler の `class_name` / `entrypoint` は一致させる。

```text
go run github.com/syumai/workers-go/cmd/workers-assets-gen@<pin> \
  -mode=go \
  -runtime=cloudflare \
  -durable-objects=Desk \
  -workflows=PublishClip \
  -entrypoints=ClipService:create,summarize,search,sendDigest
```

Deno 側は同じピンで `-runtime=deno -mode=go`。`main.mjs` と、デプロイ時に発見される `crons.mjs` が生成される。

## 利用者の動線

一台の机。認証はオーナーだけの共有シークレット（Wrangler secret）。照合は Web Crypto の一定時間比較。識別子は `crypto.randomUUID` または `crypto.getRandomValues`。

1. 机を開く。Hono が HTML を返す。Go ミドルウェアが `cf.FromRequest` でコロと国を読み、応答ヘッダに足す。フッターは `versions.NewWorkerVersionMetadata` の id / tag / timestamp。
2. URL か文章を置く。ミドルウェアが `ratelimit.Limit`（キーはクライアント IP）。超えたら机はそのまま、クリップは作らない。
3. 通過したら Hono が `ClipService.create` を呼ぶ。RPC が KV に下書きの見出しを書き、`queues.Queue.Send` で処理メッセージを積む。Analytics Engine に 1 点書く（action、国、コロ）。
4. 消費側（安定版 `cloudflare/queues.ConsumeNonBlock`。理由はインベントリ）が `workflows.Workflow.Create` で `PublishClip` を始める。
5. Workflow の段:
   - 本文を取る。Dispatch binding があるときだけ `dispatch.GetClient(プラグイン名)` に抽出を任せる。無いときは本体の `fetch`。
   - `images` でサムネイルを作り、本文とサムネイルを R2 に `Put`。
   - `ai.RunTextGeneration` で短い要約。`ai.RunTextEmbeddings` のベクトルを `vectorize.Upsert`。
   - 類似は `vectorize.Query`。
   - KV の見出しを更新する。
   - `step.Sleep` で短い待ち。
   - `step.WaitForEvent` で「机に残す」を待つ。利用者が公開操作をすると `WorkflowInstance.SendEvent`。
   - Hyperdrive binding があるときだけ `(*Hyperdrive).Connect` 経由の Postgres に書誌を書く。
   - `sendemail.Send` でオーナーへ「置いた」便り。
6. 保存前の要約プレビューは、そのクリップへの通常の WebSocket（`websocket.Upgrade`）に `ai.RunTextGenerationStream` のトークンを流す。ハンドラは Upgrade のあとすぐ戻り、読み書きは goroutine。
7. 机を開いたままの同期は、利用者名 `owner` の Durable Object `Desk`。`websocket.UpgradeHibernating` と `AcceptHibernatingConn`。下書き本文は DO storage、操作ログは `SQL().OpenDB()`。無操作が続いたら alarm で下書きを KV に退避する。
8. 公開済みクリップの GET は Cache API（`cache.Caches().Default()` の match / put）。下書きはキャッシュしない。
9. 週に一度、Deno 側の cron が本体の `ClipService.sendDigest` を呼ぶ。KV の一週間分をまとめ、`sendemail.Send` で届ける。
10. メールで URL を転送すると `yohaku-inbox` が受ける。Secrets Store の HMAC があれば検証し、`create` を呼ぶ。受領を `Reply` する。
11. `/admin` は次を見せる。version metadata、任意 binding（Hyperdrive、Dispatch、Secrets Store、Deno の URL）の解決可否、KV に溜めた直近 trace、Deno `/health`（hostname、memory、最後の flush）。

## `exp/` の対応

`exp/internal` は製品の機能にしない。`exp/internal/jsrt` は生成バインディングが内部で使う実行時ヘルパで、生成 API を呼ぶたびに使われる。`exp/internal/gen/overrides/*.yaml` はコード生成の入力であり、デプロイする成果物ではない。

安定版 `cloudflare/` にある D1、Workers の Cron、Sockets の直接 API は、この机の機能には加えない。Sockets は Hyperdrive を有効にしたときに `Hyperdrive.Connect` の先で使われる。Queue の消費だけは、生産した仕事を机が終わらせるために安定版 `cloudflare/queues` を使う。`exp/cloudflare/queues` は生産側だけを生成している。

| `exp` のパッケージ | 机のどこで使うか | binding / 資源 | 備考 |
| --- | --- | --- | --- |
| `exp/hono` | 全 HTTP のミドルウェア。シークレット検証、`cf` の刻印、レート制限、公開 GET のキャッシュ | なし（JS の Hono アプリがホスト） | `ChainMiddlewares` + `ServeMiddleware`。経路自体は JS |
| `exp/cloudflare/cf` | クリップに「どこから置いたか」（国、コロ）を残す。ミドルウェアが `FromRequest` | なし | `workers.Serve` 以外でも、ランタイムが request を context に載せていることが条件。実装時に Hono 経由の `*http.Request` で確認する |
| `exp/cloudflare/ratelimit` | クリップ作成の回数 | `[[ratelimits]]` 相当。名前 `CLIP` | キーは IP |
| `exp/cloudflare/versions` | フッターと `/admin` | `version_metadata` binding `CF_VERSION_METADATA` | |
| `exp/cloudflare/kv` | 見出し、公開状態、ダイジェストの元、tail の直近 | KV `CLIPS` | 本文そのものは R2 |
| `exp/cloudflare/r2` | 本文、元画像、サムネイル | R2 `BODIES` | `Head` / `Get` / `Put` / `List`。大きい物体はストリームのまま渡し、バイト列にまとめない |
| `exp/cloudflare/images` | サムネイル | Images binding `IMAGES` | 画像の無いクリップは段をスキップ |
| `exp/cloudflare/ai` | 要約、埋め込み、プレビューのストリーム。`Models` は `/admin` がモデル名の解決に使う | AI binding `AI` | ベクトル次元は Vectorize の index と一致させる |
| `exp/cloudflare/vectorize` | 類似クリップと検索 | index binding `SIMILAR` | `Upsert` と `Query`。`Describe` は `/admin` |
| `exp/cloudflare/queues` | 作成直後の処理メッセージ。`Send` と、山が見えるときの `Metrics` | producer `CLIP_JOBS` | 消費は安定版 `cloudflare/queues.ConsumeNonBlock` |
| `exp/cloudflare/workflows` | 「残す」までの段。スリープ、公開イベント待ち、失敗時の `NonRetryable` | `[[workflows]]` binding `PUBLISH`、class `PublishClip` | クライアント API（`Create`、`Get`、`Status`、`SendEvent`）と `Register` の両方 |
| `exp/cloudflare/analytics` | 作成・公開・便りの件数 | dataset binding `USAGE` | `WriteDataPoint` のみ |
| `exp/cloudflare/cache` | 公開クリップの GET | Cache API。binding 不要 | 下書きは対象外 |
| `exp/cloudflare/websocket` | 要約トークンのプレビュー | なし | `Upgrade`。すぐ return する |
| `exp/cloudflare/durableobjects` | 開いている机。下書き、操作ログ、無操作時の退避、接続中の同期 | DO binding `DESK`、class `Desk`、SQLite migration | `Register`、storage、`SQL().OpenDB()`、alarm、`AcceptHibernatingConn`、`GetWebSockets` |
| `exp/cloudflare/rpc` | 経路・Workflow・受信箱・Deno が呼ぶ `ClipService`（`create`、`summarize`、`search`、`sendDigest`） | `[[services]]` binding `CLIP_SERVICE`、entrypoint `ClipService`、自分自身へ | `Register` と `NewStub` |
| `exp/cloudflare/email` | 本体は送信（置いた通知、週次便り）。受信箱 Worker は `Handle`、`ForwardableEmailMessage`、`Reply` | `send_email` binding `EMAIL`。受信は Email Routing が inbox Worker へ | 本体と受信箱でプロセスを分ける |
| `exp/cloudflare/secretsstore` | 受信メールの HMAC | binding `INBOX_HMAC` | 未設定なら受信箱は検証できず拒否し、`/admin` にその旨を出す。Wrangler secret へのフォールバックは採らない（binding の有無が製品の状態になる） |
| `exp/cloudflare/tail` | 別 Worker が trace を KV へ。`/admin` が机の様子として見せる | 本体の `tail_consumers`。tail Worker から KV へ | `TraceItem.EventKind` と種別アクセサ。tail は再送されない |
| `exp/cloudflare/hyperdrive` | 書誌の長期保管 | binding `LIBRARY` | 任意。無い机は KV + R2 + DO SQL だけで完結する。`Connect` を `database/sql` の dialer にする |
| `exp/cloudflare/dispatch` | 取り込みプラグイン（抽出を外の Worker に渡す） | binding `EXTRACTORS` | 任意。Workers for Platforms が使えるアカウントだけ。無いときは本体の `fetch` |
| `exp/deno` | 取り込み箱。`OpenKv` で未送信を保持し、`Kv.Enqueue` / `ListenQueue` で手元の列を流し、`OnCron` で週次と flush。`GetEnv`、`Hostname`、`GetMemoryUsage` を `/health` に出す | Deno Deploy または `deno run`。Workers の binding ではない | 下の「Deno」 |
| `exp/internal/jsrt` | 製品機能にしない | | 生成コード経由でのみ |
| `exp/internal/gen` | 製品機能にしない | | 生成器の入力 |

### Deno でしか動かないもの

`exp/deno` は `Deno` グローバル向けで、Workers の中では動かない。取り込み箱は次の二段にする。

- Deno Deploy、および `workers-assets-gen -runtime=deno` が書く `crons.mjs` では `deno.OnCron("flush", ...)` と `deno.OnCron("digest", ...)`。Deploy はトップレベルで `Deno.cron` を評価しないと cron を発見できない。Go から `deno.Cron` を呼んでも発見されない。
- 手元の `deno run` では、生成関数 `deno.Cron` も同じハンドラに繋いでよい。Deploy の経路は `OnCron` に固定する。

週次の実処理（まとめと送信）は本体の `sendDigest`。Deno は時計と未送信キューを持つ。

### 一つの Worker に載せられないもの

| 機能 | 理由 | 扱い |
| --- | --- | --- |
| tail | 別スクリプトの `tail()`。`tail.Handle` が専用のブロック入口 | `yohaku-tail` |
| 受信メール | `email.Handle` が専用のブロック入口。Email Routing の送り先も Worker 単位 | `yohaku-inbox` |
| `exp/deno` 一式 | Workers に `Deno` が無い | `yohaku-capture` |
| Dispatch | 名前空間と、その中のユーザー Worker が別に要る。プランが限られる | 任意。`/admin` が未設定を示す |
| Hyperdrive | オリジンの Postgres / MySQL が別に要る | 任意。`/admin` が未設定を示す |
| Secrets Store | ストアとシークレットの作成が別に要る | 受信検証に使う。未作成なら受信は拒否 |

Queue、DO、Workflow、RPC、送信メール、Cache、AI、KV、R2、Vectorize、Images、Analytics、Rate Limit、version metadata、通常の WebSocket は本体の一つの Worker に載る。DO と Workflow と RPC は、`workers-assets-gen` が `worker.mjs` に足すクラス経由で、Hono の `fetch` とは別のエクスポートになる。

## ディレクトリ

このリポジトリの「直下に一つ」に合わせ、実装も `yohaku/` の中に閉じる。この PR は `DESIGN.md` だけ。

```text
yohaku/
  DESIGN.md
  README.md              # 実装時。机の使い方と、この設計へのリンク
  go.mod                 # module github.com/syumai/workers-playground/yohaku
  go.sum
  package.json           # hono、wrangler。build / dev / deploy
  wrangler.jsonc         # 本体
  Makefile
  main.go                # Register 群と hono.ServeMiddleware
  js/index.mjs           # Hono の経路。生成 Worker のクラスを再エクスポート
  inbox/main.go          # email.Handle のみ
  inbox/wrangler.jsonc
  tail/main.go           # tail.Handle のみ
  tail/wrangler.jsonc
  capture/main.go        # exp/deno
  capture/crons は生成物 # workers-assets-gen -runtime=deno が build/ に書く
```

モジュールは一つ。`inbox`、`tail`、`capture` は別 `main` パッケージ。`capture` のビルドは `exp/cloudflare` を import しない。Wasm に Workers 側を混ぜないため。

## Go モジュールのピン

最新タグ `v0.36.0`（2026-09-21、`ba33a670`）の `exp/` は `exp/hono` だけ。`exp/cloudflare` と `exp/deno` と `exp/internal` は、その後の `main` `a38be307` にある。タグが付くまで、require はこのコミットの pseudo-version にする。

```bash
go get github.com/syumai/workers-go@a38be30753a413b075ec7344faa6a26acb436d42
```

Go が計算する pseudo-version は、コミット時刻（UTC 2026-09-23 18:49:45）から `v0.36.1-0.20260923184945-a38be30753a4` になる想定。実装時は `go get` の結果を採用し、手で時刻を書かない。

`workers-assets-gen` はライブラリと同じバージョンを `go run github.com/syumai/workers-go/cmd/workers-assets-gen@<そのバージョン>` で起動する。生成 JS と Go のハンドラ名がずれるのを避ける。

`replace` は、手元で `workers-go` を同時に改変するときだけ使う。デプロイする `go.mod` の既定には置かない。

`workers-go` の `go` 行は 1.21.3、README の要件は Go 1.24 以降。この机の toolchain は実装時点の安定版で、1.24 以上にする。

## ビルド

`-mode=go`（標準の Go Wasm）。TinyGo はこの机に使わない。`exp/deno` が `reflect` を使い、DO の SQL ドライバが `database/sql` を使い、生成コードがジェネリクスに依存する。プレイグラウンドの小さな TinyGo 例とは目的が違う。

Wrangler は 4 系。`workers-go` テンプレートの `wrangler@3.109.2` は、Workflows や SQLite 付き DO の設定を実装する時点のスキーマと揃えない。実装時は、そのとき入っている Wrangler の config schema でキーを確認する（以下は意図であり、スキーマより優先しない）。

`compatibility_date` は `2026-10-24`。古い例にある `streams_enable_constructors` は、この日付ではフラグにしない。

新規 Worker として logs と traces を両方有効にする。

```jsonc
{
  "observability": {
    "enabled": true,
    "traces": { "enabled": true }
  }
}
```

本体の `tail_consumers` は `yohaku-tail` を指す。traces と Tail Worker は両方必要で、traces だけでは `exp/cloudflare/tail` のハンドラは走らない。

スクリプトサイズの上限は、2026-10-12 時点の [Workers Limits](https://developers.cloudflare.com/workers/platform/limits/) でプラン共通 64 MiB（非圧縮）。起動は 1 秒。無料プランの CPU はリクエストあたり 10 ms。Go Wasm の起動と、AI・画像・Workflow は 10 ms を超えやすい。デプロイ先は Workers Paid を前提にし、実装時に `wrangler check startup` と `wrangler deploy --dry-run --outdir` で起動時間とサイズを見る。ローカルの `wrangler dev` はプランに依存しない。

## 設定の骨子

値はプレースホルダ。ID はダッシュボードで作ったものを実装時に入れる。リポジトリの先例（`queues/producer-consumer`）には実 ID がコミットされている箇所がある。余白では、リモートの実 ID をコミットするか、`.dev.vars` と Wrangler の環境に逃がすかを実装の最初に決める。設計としては、秘密と本番 ID はコミットしない。

```jsonc
{
  "name": "yohaku",
  "main": "js/index.mjs",
  "compatibility_date": "2026-10-24",
  "workers_dev": true,
  "ai": { "binding": "AI" },
  "images": { "binding": "IMAGES" },
  "version_metadata": { "binding": "CF_VERSION_METADATA" },
  "kv_namespaces": [{ "binding": "CLIPS", "id": "<create>" }],
  "r2_buckets": [{ "binding": "BODIES", "bucket_name": "yohaku-bodies" }],
  "analytics_engine_datasets": [{ "binding": "USAGE", "dataset": "yohaku_usage" }],
  "vectorize": [{ "binding": "SIMILAR", "index_name": "yohaku-clips" }],
  "ratelimits": [{ "name": "CLIP", "namespace_id": "1001", "simple": { "limit": 30, "period": 60 } }],
  "queues": {
    "producers": [{ "binding": "CLIP_JOBS", "queue": "yohaku-clips" }],
    "consumers": [{ "queue": "yohaku-clips" }]
  },
  "durable_objects": {
    "bindings": [{ "name": "DESK", "class_name": "Desk" }]
  },
  "migrations": [{ "tag": "v1", "new_sqlite_classes": ["Desk"] }],
  "workflows": [{ "name": "publish-clip", "binding": "PUBLISH", "class_name": "PublishClip" }],
  "services": [{ "binding": "CLIP_SERVICE", "service": "yohaku", "entrypoint": "ClipService" }],
  "send_email": [{ "name": "EMAIL" }],
  "tail_consumers": [{ "service": "yohaku-tail" }]
}
```

任意。未設定の机でも 1 から 9 の動線は完結する（Hyperdrive の段と Dispatch の段と、HMAC が必要な受信を除く）。

```jsonc
{
  "hyperdrive": [{ "binding": "LIBRARY", "id": "<hyperdrive-config>" }],
  "dispatch_namespaces": [{ "binding": "EXTRACTORS", "namespace": "yohaku-extractors" }],
  "secrets_store_secrets": [{ "binding": "INBOX_HMAC", "store_id": "<store>", "secret_name": "inbox-hmac" }]
}
```

受信箱 Worker は `send_email` と `CLIP_SERVICE`（本体への service binding）と、使うなら `INBOX_HMAC`。tail Worker は `CLIPS` と同じ KV。Deno に Workers の binding は無い。本体の URL と共有シークレットは Deno の環境変数（`exp/deno` の `GetEnv`）。

## 作る資源と費用

個人の一台分に量を抑える。正確な included quota は実装日に各製品の料金ページで見る。ここは 2026-10-24 時点の切り分け。

| 資源 | 机での役割 | 費用の見立て |
| --- | --- | --- |
| Worker `yohaku` / `yohaku-inbox` / `yohaku-tail` | 上記三プロセス | [Limits](https://developers.cloudflare.com/workers/platform/limits/) の無料枠は 10 万リクエスト/日、CPU 10 ms。Go Wasm と AI を考えると Paid が前提。スクリプトサイズは両プラン 64 MiB |
| KV、R2 | 見出しと本文 | どちらも無料枠がある。本文は R2、細かいキーだけ KV。画像を KV に置かない |
| Queue `yohaku-clips` | 作成後の一段 | 操作はクリップの回数だけ。まとめ送り（`SendBatch`）は初期実装では使わない |
| DO `Desk`（SQLite） | 開いている下書き | 利用者は一人、オブジェクトは一つ。アラームは無操作の退避だけ |
| Workflow `PublishClip` | 要約から公開まで | クリップごとに 1 インスタンス。段の中で外部 I/O をまとめ、細かい段を増やさない |
| Workers AI | 要約と埋め込み | ニューロン課金。短い要約と、index 次元に合う埋め込みモデルを一つずつ固定する |
| Vectorize | 類似 | 格納ベクトルはクリップ数。次元は埋め込みモデルに合わせ、必要以上に上げない |
| Analytics Engine | 利用の点 | 作成・公開・便りの 3 種だけ |
| Rate Limit | 作成の制限 | binding 自体の追加料金は期待しない。namespace は 1 |
| Cache API | 公開 GET | 追加の資源作成は不要 |
| version metadata | フッター | 追加料金なし |
| Images | サムネイル | 変換は従量になりうる。サムネイルは幅を一つに固定する |
| Email Routing + `send_email` | 取り込みと便り | Routing の受信はゾーンの機能。送信先はオーナーのアドレスに限定する。ゾーンと宛先はオーナーのドメインが要る |
| Secrets Store | 受信 HMAC | 有料のストア。作らない選択なら受信箱は動かさず、HTTP と Deno の取り込みだけで机を使える |
| Hyperdrive + オリジン DB | 書誌 | 任意。オリジンは Neon 等の無料枠を想定し、Hyperdrive 設定は一つ。未設定なら作らない |
| Dispatch namespace | 抽出プラグイン | 任意。Workers for Platforms が使えるアカウントだけ。未設定なら作らない |
| Deno Deploy または手元の Deno | 取り込み箱と週次 | Deploy の無料枠、またはオーナーのマシン。Workers の請求には入らない |

D1 は作らない。`exp/` に D1 パッケージが無く、安定版 `cloudflare/d1` を机の機能にしないため。

## ローカルとデプロイ

`make dev` は本体ディレクトリで `wrangler dev`。Queue consumer、DO、KV、R2 はローカルシミュレーションで机の骨格を見る。次はリモートかダッシュボードが要る。

| 操作 | ローカル `wrangler dev` | 確認の仕方 |
| --- | --- | --- |
| Hono、RPC、レート制限の拒否、Cache の hit | 見られる | `curl` とブラウザ |
| KV、R2、DO の下書きと WebSocket、Queue の生産と消費 | シミュレーションで見られる | クリップを置いて机に戻るまで |
| AI、Vectorize、Images、Analytics | リモート実行かデプロイ後 | `wrangler dev --remote` を実装時に一つの経路で確認 |
| Email、Tail、Secrets Store、Hyperdrive、Dispatch | ローカルでは閉じない | リソースを作ったあとのデプロイ。未作成なら `/admin` が「未設定」と出ることをローカルで見る |
| Deno | `deno run` と、生成された `crons.mjs` | 取り込みが本体の `create` に届くこと |

手順の骨子:

1. `go get` でピンを固定し、`npm install`。
2. KV、R2、Queue、Vectorize index、AI、Images、Analytics dataset、Rate Limit、DO migration、Workflow をアカウントに作る。Email、Secrets Store、Hyperdrive、Dispatch は使うと決めたものだけ。
3. `make build`（assets-gen、`GOOS=js GOARCH=wasm go build`、inbox と tail と capture も同様）。
4. `wrangler dev` で机に一件置く。
5. `wrangler deploy` を本体、inbox、tail の順。本体の `tail_consumers` は tail のデプロイ後に有効になるので、初回は tail を先にしてもよい。依存順は実装時に一度通す。
6. Email Routing のルールで、決めた宛先を inbox Worker へ。
7. capture は `deno task dev`、Deploy する場合は Deno のデプロイ手順。

## `exp` の変化への追従

`exp/` は workers-types に沿ってフィールドが増減する、と `exp/cloudflare` の README が明記している。机は生成 API の広い表面を包まず、上の表のメソッドだけを呼ぶ。

このリポジトリに Renovate も Dependabot も CI も無い。プレイグラウンド全体を更新対象にすると、古い実験まで巻き込む。追従は `yohaku/` に限る。

- タグが `exp/cloudflare` と `exp/deno` を含むようになったら、pseudo-version をそのタグへ上げる。それまでは Dependabot のバージョン更新ではピンが動かない。
- タグのあとは、リポジトリ直下の Dependabot で `yohaku` ディレクトリの gomod と npm（`hono`、`wrangler`）だけを週次にする。
- CI は `yohaku` の Wasm ビルド三つ（本体、inbox、tail）と capture の Deno 向けビルド。`GOOS=js GOARCH=wasm go build`。デプロイはしない。`gofmt` と、Wasm 向けの `go test` は `//go:build js && wasm` のテストがプレイグラウンド側に生まれてから。
- 週次で、ピンを変えずに `@main` を一時モジュールでビルドするジョブを別に置く。失敗したら「`exp` の main が机と離れた」と分かる。自動で `go.mod` は書き換えない。
- `workers-assets-gen` の版は require と同じものに保つチェックを、Makefile のビルドが一つのバージョン定数を両方に渡すことで満たす。

## 未決事項

オーナーの判断が要る。

1. 名前「余白 / yohaku」でよいか。Worker 名は `yohaku`、`yohaku-inbox`、`yohaku-tail`。
2. デプロイ先のアカウントは Workers Paid でよいか。無料プランの CPU 10 ms では Go Wasm と AI が収まらない見込み。
3. 利用者はオーナー一人でよいか。共有シークレット方式はこの前提。
4. 受信メールに使うドメインと、便りの宛先アドレス。無ければ inbox は後回しにし、HTTP と Deno だけで机を完成させる。
5. Secrets Store を受信 HMAC に使うか。使わないなら受信は実装しない（秘密の置き場を二系統にしない）。
6. Hyperdrive 用の Postgres を用意するか。無ければ書誌は KV と R2 と Desk の SQLite だけ。
7. Workers for Platforms の dispatch 名前空間を用意するか。無ければ抽出プラグインは後回し。
8. Deno の取り込み箱は Deno Deploy か、手元の `deno run` か、両方か。週次便りの時計はここにある。
9. 公開クリップ（Cache API の対象）を最初から作るか。プライベートだけなら Cache は「公開」をオンにしたクリップに限定し、初期は誰も公開しない。
10. 要約と埋め込みの Workers AI モデル。次元が Vectorize index を決める。短い文章向けの組をオーナーが指定する。
11. `email` に非ブロック登録を `workers-go` 側へ足すか。この設計は足さず、受信を `yohaku-inbox` に分けている。一つの Worker にまとめたい場合は、ライブラリ側の変更が先。
12. リモート資源の ID を `wrangler.jsonc` にコミットするか。設計は秘密と本番 ID をコミットしない方針。
13. `cf.FromRequest` が Hono ミドルウェアの `*http.Request` で request.cf を読めるか。読めない場合、ミドルウェアは JS から渡したヘッダ（国、コロ）を信頼する形に変える。実装の最初のスパイクで決める。
