# バグ受信箱（bug-inbox）設計

個人開発者が、自分のアプリの利用者から届いたバグ報告を、スクリーンショットと過去の似た報告と一緒に見て返信する受信箱。実装はこの文書の合意後。本文は設計のみ。

調査時点: 2026-10-24。`workers-go` の `main` は `a38be30753a413b075ec7344faa6a26acb436d42`（2026-09-24、PR #237）。生成バインディングの元は `@cloudflare/workers-types@5.20260906.1`（`exp/cloudflare.WorkersTypesVersion`）。`exp/deno` はこのサービスでは使わない。

## 置き場所

`syumai/workers-playground` の直下 `bug-inbox/`。

このリポジトリは実験 1 つが直下のディレクトリで、Go の例は `Makefile` と Wrangler 設定と `go.mod` を持つ。`docs/` は無い。設計は将来の実装と同じ `bug-inbox/DESIGN.md` に置く。

`go-wasm-playground` はブラウザ Wasm の小例、`go-playground` は 2019 年で止まったほぼ空のリポジトリなので、Workers の binding を置く場所にはしない。

## 三つの候補

どれも、画面に API を並べるカタログにはしない。一文は「誰が、何に困っていて、このサービスで何ができるか」。

### 1. バグ受信箱（採用）

個人開発者が、利用者からのバグ報告（フォームまたはメール、文章とスクリーンショット）を一箇所で開き、似た過去の報告を見ながら返信する。

| 機能 | 入り方 |
| --- | --- |
| フォーム、Hono、Rate Limit、`cf` | 利用者はログインせず報告する。連投を止め、どの国から届いたかを報告に残す |
| メールの受信と返信 | 報告の入口と、開発者からの返事そのもの |
| R2、Images、AI、Vectorize | スクショを残し、一覧用のサムネイル、要約、過去の似た報告 |
| Queue、Workflow | 受け付けた直後に画面を返し、要約から保存までを後ろで終わらせる。返信ボタンが Workflow の「送ってよい」になる |
| Durable Object、WebSocket | 開いている報告に、処理の完了や下書きの返信文がそのまま出る。未返信のまま時間がたったら開発者に知らせる |
| KV、Cache、Analytics | 報告の状態、公開する既知の不具合ページ、今日何件届いたか |
| RPC | フォーム、メール受信、Workflow が同じ「報告を作る・返信する」を呼ぶ |

Secrets Store、Tail、version metadata、Hyperdrive、Dispatch は、報告を読んで返す仕事の外なので管理画面に置く。

### 2. あとで読む

自分が URL を投げ、本文と要約を残し、似た記事を後から探す。

メール転送での保存、要約、類似検索は自然。スクリーンショット、公開ページ、レート制限、報告者の国、開いている画面の同期は、一人が記事を貯める目的には付きにくい。前回の「余白」と同じ仕事を、名前だけ分かりやすくしたものに近い。

### 3. 現場写真報告

大家や設備担当が、現場から届く写真付きの「ここが壊れている」を案件にして、依頼主にメールで返す。

写真、要約、似た案件、メールは自然。公開の既知不具合ページや、開発者が自分のアプリに対して使う必然は弱い。syumai が日常で開くサービスにはなりにくい。

バグ受信箱を採る。届ける、残す、似たものを探す、返信する、がそのまま利用者と開発者の操作で、メールとスクリーンショットが装飾にならない。使う人はオーナー一人の開発者で、報告者はログインしない。

## 誰が何をするか

登場人物は二人。

- **報告者。** オーナーのアプリを使っている人。アカウントは無い。
- **開発者。** オーナー本人。受信箱を開くときに共有シークレットを入れる。照合は Web Crypto の一定時間比較。報告 ID は `crypto.randomUUID`。

### 画面

| 画面 | 経路 | 誰が見るか | 見えるもの |
| --- | --- | --- | --- |
| 報告フォーム | `GET /report` | 報告者 | 起きたこと、再現手順、スクリーンショット |
| 受け付けた | `GET /report/sent?id=` | 報告者 | 受付番号。要約はまだ無くてよい |
| 受信箱 | `GET /` | 開発者 | 新しい順の一覧。サムネイル、一行要約、状態（処理中 / 未返信 / 返信済み / 既知の不具合）、今日の件数 |
| 報告 | `GET /reports/:id` | 開発者 | 本文、スクショ、要約、似た過去の報告、返信欄。処理が終わるとリロードせずに要約と類似が出る |
| 既知の不具合 | `GET /known` | 誰でも | 開発者が「既知」にした報告のタイトルと要約 |
| 管理 | `GET /admin` | 開発者 | 下の「管理に置くもの」 |

### 報告者がフォームから送る

1. `/report` を開く。Hono がページを出し、Go のミドルウェアがレート制限を見る。超えていたら「しばらく待って」と出し、報告は作らない。
2. 文章と画像を送る。ミドルウェアは `cf` から国とコロを読む。
3. 受付番号を KV に書き、画像の原本はすぐ R2 に置き、Queue に「この報告を処理して」を積んで、`/report/sent` を返す。要約が終わるまで待たせない。
4. 背後の Workflow がサムネイル、要約、埋め込み、類似の下調べ、開発者への「新しい報告」メールまで進める。
5. 開発者がその報告を開いていれば、要約と類似が画面に足される。

### 報告者がメールで送る

1. 決めた宛先（例: `bugs@` のオーナーのドメイン）に、本文と画像付きで送る。
2. メール用の Worker が受け、画像を取り出し、本体の RPC「報告を作る」を呼ぶ。フォームと同じ Queue と Workflow に入る。
3. 受付番号を、そのメールへの返信で返す。

### 開発者が返信する

1. `/` で未返信を開き、`/reports/:id` に入る。
2. 要約と、似た過去の報告（タイトルと受付番号）を読む。スクショは大きく表示し、一覧にはサムネイルだけ出る。
3. 「返信の下書き」を押すと、返信欄に文章が少しずつ出る。
4. 直して「送信」を押す。Workflow が報告者のアドレスへメールし、状態が返信済みになる。報告者がメールで届いていた場合は、そのスレッドへの返信にする。
5. 未返信のまま数時間たつと、開発者自身に「まだ返していない」メールが届く。

### 既知の不具合を公開する

開発者が報告を「既知の不具合」にすると、`/known` にタイトルと要約が出る。このページはキャッシュする。下書きや未公開の報告は出さない。

## プロセス

Go のブロックする入口はプロセスにつき一つ。本体は `hono.ServeMiddleware`。Durable Object、Workflow、RPC、Queue の消費登録はその前に行う。`workers.Serve` は使わない。`_examples` が `workers.Serve` の前に登録している形を、Hono のブロックに置き換える。実装時に、Workflow と Durable Object のトリガーでこの置換が動くことを例と突き合わせて確認する。

`email.Handle` と `tail.Handle` は登録とブロックが分かれていない（`a38be307` 時点。Queue の `ConsumeNonBlock` に相当する公開関数が無い）。受信メールと Tail は別 Worker にする。本体は送信 binding だけを使う。

```text
報告者 ──フォーム──► bug-inbox（Hono + Go）
                      │ Queue → Workflow
                      │ 返信メール、開発者への通知
報告者 ──メール────► bug-inbox-mail ──RPC──► bug-inbox
bug-inbox の trace ──► bug-inbox-tail ──► KV（管理画面が読む）
```

| プロセス | 入口 | 役割 |
| --- | --- | --- |
| `bug-inbox` | `hono.ServeMiddleware` | フォーム、受信箱、報告画面、既知の不具合、返信の送信、Queue の生産と消費、Durable Object、Workflow、RPC |
| `bug-inbox-mail` | `email.Handle` | 届いたメールを報告にし、受付返信をする |
| `bug-inbox-tail` | `tail.Handle` | 本体の trace を KV に書き、管理画面に出す |

Wrangler の `main` は生成された `build/worker.mjs` の `fetch` をそのまま使わない。生成物は `handleRequest` を呼ぶが、本体は `workers.Serve` を起動しない。`js/index.mjs` が Hono の経路を持ち、リクエストごとに Wasm を起こして `binding.runHonoMiddleware(next)` を呼ぶ。経路の中身は Service binding 経由で RPC `ReportService` を呼ぶ。`queue` と、生成された Durable Object / Workflow / `WorkerEntrypoint` のクラスは `build/worker.mjs` から再エクスポートする。

クラス名は、`workers-assets-gen` のフラグ、Go の `Register`、Wrangler の `class_name` / `entrypoint` で一致させる。

```text
go run github.com/syumai/workers-go/cmd/workers-assets-gen@<pin> \
  -mode=go \
  -runtime=cloudflare \
  -durable-objects=ReportRoom \
  -workflows=ProcessReport \
  -entrypoints=ReportService:create,draftReply,sendReply,markKnown
```

## 各機能が画面のどこに出るか

`exp/internal/jsrt` は生成バインディングが内部で使うヘルパなので、画面には出さない。`exp/internal/gen` はコード生成の入力なのでデプロイしない。`exp/deno` は対象外。

安定版 `cloudflare/` の D1、Workers の Cron、Sockets の直接 API は機能に加えない。Sockets は、管理画面で Hyperdrive を有効にしたときに `Hyperdrive.Connect` の先でのみ使われる。Queue の消費は、`exp/cloudflare/queues` が生産側だけなので、安定版 `cloudflare/queues.ConsumeNonBlock` で行う。消費は「処理を後ろで終わらせる」ために必要で、画面用の別デモにはしない。

### 報告の流れに入るもの

| パッケージ | 製品での仕事 | 画面 | binding / 資源 |
| --- | --- | --- | --- |
| `exp/hono` | 全ページの手前。開発者ページは共有シークレット、`/report` と `/known` は通す。レート制限と `cf` の読み取りもここ | 全部 | なし。JS の Hono が経路を持つ |
| `exp/cloudflare/ratelimit` | 報告フォームの連投を止める。キーは IP | `/report` | `CLIP` ではなく `REPORT`。期間あたりの上限は小さめ |
| `exp/cloudflare/cf` | 報告に「どの国・どのコロから届いたか」を残し、詳細に表示する | 報告詳細 | なし |
| `exp/cloudflare/kv` | 受付番号、状態、要約、報告者アドレス、既知フラグ | 受信箱、詳細、既知の不具合 | KV `REPORTS` |
| `exp/cloudflare/r2` | スクリーンショットの原本 | 報告詳細 | R2 `SHOTS`。一覧には置かない |
| `exp/cloudflare/images` | 一覧用サムネイルを一サイズで作る | 受信箱 | Images `IMAGES`。画像が無ければ段を飛ばす |
| `exp/cloudflare/ai` | 報告の短い要約。返信欄へ流す下書き | 詳細の要約と返信欄 | AI `AI` |
| `exp/cloudflare/vectorize` | 過去の報告との類似。詳細に受付番号つきで出す | 報告詳細 | index `SIMILAR`。次元は埋め込みモデルに合わせる |
| `exp/cloudflare/queues` | フォームとメール受付の直後に処理を積む。`Send`。滞留は `Metrics` で管理ではなく受信箱の「処理待ち」件数に使う | 受け付けた直後、受信箱の待ち件数 | producer `REPORT_JOBS` |
| `exp/cloudflare/workflows` | サムネイル、要約、埋め込み、類似の下調べ、開発者への通知メール。`Sleep` は通知の短い待ち。`WaitForEvent` は開発者の「送信」。失敗のうち報告が読めないものは `NonRetryable` | 受け付けから返信まで | binding `PROCESS`、class `ProcessReport` |
| `exp/cloudflare/analytics` | 受け付け、返信、既知化を 1 点ずつ書き、受信箱の「今日の件数」に出す | 受信箱 | dataset `USAGE` |
| `exp/cloudflare/cache` | `/known` の HTML を match / put する | 既知の不具合 | Cache API。binding は不要 |
| `exp/cloudflare/websocket` | 返信の下書きトークンを `Upgrade` で流す。Upgrade のあとすぐ戻り、読み書きは goroutine | 報告詳細の返信欄 | なし |
| `exp/cloudflare/durableobjects` | 報告ごとに `ReportRoom`。開いている詳細へ要約完了を配る。下書きの途中式は storage。`SQL().OpenDB()` はその報告の状態変化（受付、要約完了、返信、既知化）の履歴。alarm は未返信のままの通知 | 報告詳細 | DO `REPORT_ROOM`、SQLite migration |
| `exp/cloudflare/rpc` | `ReportService` の `create`、`draftReply`、`sendReply`、`markKnown`。Hono、メール Worker、Workflow が呼ぶ | フォーム、詳細、メール受付 | service `REPORT_SERVICE`、entrypoint `ReportService`、自分自身へ |
| `exp/cloudflare/email` | 本体は送信（受付の控えはメール Worker、新しい報告と未返信リマインドと返事は本体またはメール Worker の `Send` / `Reply`）。受信は `Handle` と `ForwardableEmailMessage` | メール、報告詳細の送信 | `send_email` の `EMAIL`。受信は Email Routing が `bug-inbox-mail` へ |

`cf.FromRequest` は、Hono ミドルウェアの `*http.Request` に request.cf が乗っていることが条件。実装の最初のスパイクで確認する。読めない場合は、JS 側が国とコロをヘッダで渡す。

Durable Object の hibernating WebSocket（`UpgradeHibernating` と `AcceptHibernatingConn`）は、報告詳細を開いたまま要約完了を受ける接続に使う。トークンを連続して流す返信下書きは、hibernate 向きではないので通常の `websocket.Upgrade` に分ける。

### 管理画面に置くもの

報告を読んで返す操作には出てこない。`/admin` に「設定されているか」と、Tail の直近の失敗を出す。未設定でもフォームから返信までの流れは動く。

| パッケージ | 管理画面での意味 | 未設定のとき |
| --- | --- | --- |
| `exp/cloudflare/versions` | 動いている Worker の id、tag、timestamp | binding 名 `CF_VERSION_METADATA`。フッターにも同じ一行を出してよいが、利用者の目的ではない |
| `exp/cloudflare/tail` | 本体の trace を別 Worker が KV に残し、失敗した受付や Workflow を見る | Tail が無いと管理の「直近の失敗」が空になる。報告の送受信は動く |
| `exp/cloudflare/secretsstore` | 外部サイトに埋め込む報告フォーム用の署名鍵が読めるか。本体の共有シークレットは Wrangler secret のままにし、置き場を二つにしない | 埋め込みフォームは作らない。`/report` は動く |
| `exp/cloudflare/hyperdrive` | 報告の長期保管用 Postgres に繋がるか。`Connect` を `database/sql` の dialer にする | 報告は KV、R2、ReportRoom の SQLite だけで足りる |
| `exp/cloudflare/dispatch` | 要約の前に、名前空間内の分類 Worker へ本文を渡せるか。`GetClient` | 分類は本体の Workers AI だけにする |

## ディレクトリ

```text
bug-inbox/
  DESIGN.md                 # この PR はこれだけ
  README.md                 # 実装時。使い方
  go.mod                    # module github.com/syumai/workers-playground/bug-inbox
  go.sum
  package.json              # hono、wrangler
  wrangler.jsonc            # 本体
  Makefile
  main.go                   # Register と hono.ServeMiddleware
  js/index.mjs              # Hono。生成クラスを再エクスポート
  mail/main.go              # email.Handle のみ
  mail/wrangler.jsonc
  tail/main.go              # tail.Handle のみ
  tail/wrangler.jsonc
```

モジュールは一つ。`mail` と `tail` は別の `main`。

## ビルドとピン

最新タグ `v0.36.0`（2026-09-21、`ba33a670`）の `exp/` は `exp/hono` だけ。`exp/cloudflare` と `exp/internal` は `main` の `a38be307` にある。タグが付くまで require はこのコミットにする。

```bash
go get github.com/syumai/workers-go@a38be30753a413b075ec7344faa6a26acb436d42
```

Go が書く pseudo-version は、コミット時刻（UTC 2026-09-23 18:49:45）から `v0.36.1-0.20260923184945-a38be30753a4` になる想定。実装時は `go get` の出力を採用する。`workers-assets-gen` は同じバージョンを `go run ...@<そのバージョン>` で起動する。`replace` は、手元で `workers-go` を同時に直すときだけにし、デプロイ用の `go.mod` には置かない。

toolchain は Go 1.24 以上（`workers-go` の README の要件。モジュールの `go` 行は 1.21.3）。

ビルドは `-mode=go`。TinyGo にはしない。生成コードのジェネリクスと、Durable Object の SQL ドライバの `database/sql` を使うため。

Wrangler は 4 系。テンプレートの `wrangler@3.109.2` は、Workflows と SQLite 付き Durable Object の設定を実装時点のスキーマと揃えない。以下のキーは意図であり、入っている Wrangler の schema を優先する。

`compatibility_date` は `2026-10-24`。古い例の `streams_enable_constructors` はこの日付では足さない。

logs と traces を両方有効にする。

```jsonc
{
  "observability": {
    "enabled": true,
    "traces": { "enabled": true }
  }
}
```

本体の `tail_consumers` は `bug-inbox-tail` を指す。traces だけでは `exp/cloudflare/tail` のハンドラは走らない。

スクリプトサイズの上限は、2026-10-12 時点の [Workers Limits](https://developers.cloudflare.com/workers/platform/limits/) で両プラン 64 MiB（非圧縮）。起動は 1 秒。無料プランの CPU はリクエストあたり 10 ms。Go Wasm の起動と AI・画像・Workflow は 10 ms を超えやすい。デプロイ先は Workers Paid を前提にし、実装時に `wrangler check startup` と `wrangler deploy --dry-run --outdir` で起動時間とサイズを見る。`wrangler dev` はプランに依存しない。

## 設定の骨子

秘密と本番の資源 ID はコミットしない。リモート ID を `wrangler.jsonc` に書くかは実装の最初に決める。プレイグラウンドの一部の例は実 ID をコミットしているが、バグ受信箱では秘密と本番 ID をリポジトリに置かない。

```jsonc
{
  "name": "bug-inbox",
  "main": "js/index.mjs",
  "compatibility_date": "2026-10-24",
  "workers_dev": true,
  "ai": { "binding": "AI" },
  "images": { "binding": "IMAGES" },
  "version_metadata": { "binding": "CF_VERSION_METADATA" },
  "kv_namespaces": [{ "binding": "REPORTS", "id": "<create>" }],
  "r2_buckets": [{ "binding": "SHOTS", "bucket_name": "bug-inbox-shots" }],
  "analytics_engine_datasets": [{ "binding": "USAGE", "dataset": "bug_inbox_usage" }],
  "vectorize": [{ "binding": "SIMILAR", "index_name": "bug-inbox-reports" }],
  "ratelimits": [{ "name": "REPORT", "namespace_id": "1001", "simple": { "limit": 10, "period": 60 } }],
  "queues": {
    "producers": [{ "binding": "REPORT_JOBS", "queue": "bug-inbox-reports" }],
    "consumers": [{ "queue": "bug-inbox-reports" }]
  },
  "durable_objects": {
    "bindings": [{ "name": "REPORT_ROOM", "class_name": "ReportRoom" }]
  },
  "migrations": [{ "tag": "v1", "new_sqlite_classes": ["ReportRoom"] }],
  "workflows": [{ "name": "process-report", "binding": "PROCESS", "class_name": "ProcessReport" }],
  "services": [{ "binding": "REPORT_SERVICE", "service": "bug-inbox", "entrypoint": "ReportService" }],
  "send_email": [{ "name": "EMAIL" }],
  "tail_consumers": [{ "service": "bug-inbox-tail" }]
}
```

管理画面用。未設定でも報告の送受信は動く。

```jsonc
{
  "hyperdrive": [{ "binding": "ARCHIVE", "id": "<hyperdrive-config>" }],
  "dispatch_namespaces": [{ "binding": "CLASSIFIERS", "namespace": "bug-inbox-classifiers" }],
  "secrets_store_secrets": [{ "binding": "EMBED_KEY", "store_id": "<store>", "secret_name": "embed-hmac" }]
}
```

メール Worker は `send_email` と、本体への service binding `REPORT_SERVICE`。Tail Worker は同じ KV `REPORTS`。

## 作る資源と費用

個人のアプリ一つか二つに届く報告の量に抑える。included quota の数字は実装日に各製品の料金ページで見る。

| 資源 | 役割 | 見立て |
| --- | --- | --- |
| Worker 三つ | 本体、メール、Tail | 無料枠は 10 万リクエスト/日、CPU 10 ms。[Limits](https://developers.cloudflare.com/workers/platform/limits/) のサイズは両プラン 64 MiB。デプロイは Paid 前提 |
| KV、R2 | 状態とスクショ原本 | 無料枠がある。画像は R2 |
| Queue | 受付直後の処理 | 報告の回数だけ積む |
| Durable Object `ReportRoom` | 開いている報告と未返信アラーム | オブジェクトは報告の数。アラームは未返信の通知だけ |
| Workflow `ProcessReport` | 受付から返信可能になるまで | 報告ごとに 1 インスタンス |
| Workers AI | 要約と返信下書きと埋め込み | ニューロン課金。モデルは短い文章向けを一つずつ固定 |
| Vectorize | 似た報告 | 本数は報告の数。次元は埋め込みに合わせ、上げすぎない |
| Analytics Engine | 今日の件数 | 受付、返信、既知化の 3 種 |
| Rate Limit | フォームの連投 | namespace は 1 |
| Cache API | `/known` | 追加の資源は不要 |
| version metadata | 管理画面 | 追加料金なし |
| Images | サムネイル | 変換は従量になりうる。幅は一つに固定 |
| Email Routing と `send_email` | 受付と返信 | 受信はゾーンの機能。送信先は報告者と開発者のアドレスに限定。ドメインが要る |
| Secrets Store、Hyperdrive、Dispatch | 管理画面の任意項目 | 作らなくてよい。Dispatch は Workers for Platforms が使えるアカウントだけ |

D1 は作らない。`exp/` に D1 が無く、この受信箱の保管は KV、R2、ReportRoom の SQLite で足りる。

## ローカルとデプロイ

`make dev` は `wrangler dev`。KV、R2、Durable Object、Queue の骨格はローカルで、フォームから一覧に出るところまで見る。

| 操作 | どこで見るか |
| --- | --- |
| フォーム、受信箱、レート制限で拒否、`/known` のキャッシュ | ローカルの `curl` とブラウザ |
| スクショの保存、報告を開いたまま要約が足されること | ローカルのシミュレーション。AI 自体はリモート |
| AI、Vectorize、Images、Analytics | `wrangler dev --remote` かデプロイ後に、報告一件で確認 |
| メール、Tail、Secrets Store、Hyperdrive、Dispatch | 作ったものだけデプロイ後。未作成なら `/admin` が未設定と出すことをローカルで見る |

手順は、ピンの `go get` と `npm install`、必須資源の作成、三 Worker のビルド、`wrangler dev` で一件受付、`bug-inbox-tail` と `bug-inbox-mail` と本体の順で deploy、Email Routing で宛先をメール Worker へ。初回の `tail_consumers` は Tail を先に出す。

## 追従

`exp/cloudflare` は workers-types に合わせてフィールドが増減する。受信箱が呼ぶのは上の表のメソッドだけにする。

このリポジトリに Renovate も Dependabot も CI も無い。追従は `bug-inbox/` に限る。

- `exp/cloudflare` を含むタグが出たら、pseudo-version をそのタグへ上げる。それまで Dependabot ではピンは動かない。
- タグのあと、Dependabot は `bug-inbox` の gomod と npm（`hono`、`wrangler`）だけ週次。
- CI は三 Worker の `GOOS=js GOARCH=wasm go build`。デプロイはしない。
- 週次で、ピンを変えず `@main` を一時モジュールでビルドする。失敗は「main と受信箱が離れた」印で、`go.mod` は自動で書き換えない。
- `workers-assets-gen` とライブラリは Makefile の一つのバージョン定数を両方に渡す。

## 未決事項

1. 名前は「バグ受信箱」、ディレクトリは `bug-inbox` でよいか。Worker 名は `bug-inbox`、`bug-inbox-mail`、`bug-inbox-tail`。
2. デプロイ先は Workers Paid でよいか。
3. 開発者はオーナー一人、報告者はログイン無し、でよいか。
4. 受信に使うドメインと、開発者に通知するアドレス。ドメインが無ければメール Worker は後回しにし、フォームだけで受信箱を完成させる。
5. 既知の不具合ページを最初から公開するか。公開しない間、Cache は「既知」が一件以上あるときだけ使われる。
6. 要約、返信下書き、埋め込みに使う Workers AI のモデル。次元が Vectorize の index を決める。
7. 未返信リマインドは何時間後か。
8. Secrets Store、Hyperdrive、Dispatch は管理画面の任意のまま進めてよいか。
9. 受信を別 Worker のままにするか。一つの Worker にまとめるなら、`workers-go` に email の非ブロック登録が先に要る。
10. 本番の資源 ID を `wrangler.jsonc` にコミットしない方針でよいか。
11. Hono 経由の `*http.Request` で `cf.FromRequest` が読めるか。最初のスパイクで決める。
