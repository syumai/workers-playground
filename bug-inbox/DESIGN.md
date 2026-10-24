# Bug Inbox (bug-inbox) design

A bug inbox for a solo developer: reports from people using their app, with the screenshot and similar past reports on one screen, and a reply from that screen. Implementation waits until this document is agreed. This document is design only.

Researched on 2026-10-24. `workers-go` `main` is `a38be30753a413b075ec7344faa6a26acb436d42` (2026-09-24, PR #237). Generated bindings come from `@cloudflare/workers-types@5.20260906.1` (`exp/cloudflare.WorkersTypesVersion`). This service does not use `exp/deno`.

## Where it lives

`bug-inbox/` at the top of `syumai/workers-playground`.

Each experiment in this repo is a top-level directory. The Go examples use a `Makefile`, a Wrangler config, and a `go.mod`. There is no `docs/` directory. The design stays in `bug-inbox/DESIGN.md`, next to the future implementation.

`go-wasm-playground` is a handful of browser Wasm samples. `go-playground` is nearly empty and last changed in 2019. Neither is a home for Workers bindings.

## Three candidates

None of these is a catalog of API endpoints. Each pitch is one sentence: who has the problem, and what they can do.

### 1. Bug Inbox (chosen)

A solo developer opens bug reports (form or email, text and a screenshot) in one place and replies while looking at similar past reports.

| Feature | How it shows up |
| --- | --- |
| Form, Hono, Rate Limit, `cf` | Reporters submit without an account. Repeat submits are limited, and the report records the country it came from |
| Inbound and outbound email | The way a report arrives, and the developer's reply |
| R2, Images, AI, Vectorize | Keep the screenshot, a list thumbnail, a summary, and similar past reports |
| Queue, Workflow | Return a receipt immediately, then finish summary and storage in the background. The reply button is the Workflow's "ok to send" |
| Durable Object, WebSocket | An open report updates in place when processing finishes or a draft reply arrives. If it stays unanswered, the developer is notified |
| KV, Cache, Analytics | Report status, a public known-issues page, and how many arrived today |
| RPC | The form, inbound mail, and the Workflow call the same "create a report" and "send a reply" operations |

Secrets Store, Tail, version metadata, Hyperdrive, and Dispatch sit outside reading and answering a report, so they live on the admin screen.

### 2. Read later

You save a URL, keep the article text and a summary, and find similar articles later.

Saving by forwarded email, summaries, and similarity search fit. Screenshots, a public page, rate limiting, the sender's country, and live sync of an open screen do not fit someone filing articles for themselves. This is close to the earlier Yohaku idea with a plainer name.

### 3. Field photo reports

A landlord or facilities owner turns "this is broken" photos from a site into a case and emails the result back to the requester.

Photos, summaries, similar cases, and email fit. A public known-issues page, and a reason for a developer to use it on their own app, are weak. syumai is unlikely to open this day to day.

Bug Inbox is the one to build. Submit, keep, find similar, and reply are the reporter's and the developer's actual actions, so email and screenshots are the product. The developer is the owner alone. Reporters do not log in.

## Who does what

Two people.

- **Reporter.** Someone using the owner's app. No account.
- **Developer.** The owner. Opening the inbox requires a shared secret, compared with a constant-time Web Crypto check. Report IDs are `crypto.randomUUID`.

### Screens

| Screen | Path | Who | What they see |
| --- | --- | --- | --- |
| Report form | `GET /report` | Reporter | What happened, steps to reproduce, a screenshot |
| Received | `GET /report/sent?id=` | Reporter | A receipt number. The summary can still be missing |
| Inbox | `GET /` | Developer | Newest first. Thumbnail, one-line summary, status (processing / unanswered / replied / known issue), today's count |
| Report | `GET /reports/:id` | Developer | Body, screenshot, summary, similar past reports, reply box. When processing finishes, the summary and similar reports appear without a reload |
| Known issues | `GET /known` | Anyone | Title and summary of reports the developer marked known |
| Admin | `GET /admin` | Developer | The items under "On the admin screen" below |

### A reporter submits the form

1. They open `/report`. Hono serves the page. Go middleware checks the rate limit. Over the limit, the page says to wait, and no report is created.
2. They send text and an image. Middleware reads country and colo from `cf`.
3. The receipt number is written to KV, the original image goes straight to R2, a "process this report" message is queued, and the response is `/report/sent`. The reporter does not wait for the summary.
4. The Workflow in the background produces the thumbnail, summary, embedding, a first look at similar reports, and a "new report" email to the developer.
5. If the developer already has that report open, the summary and similar reports appear on the page.

### A reporter sends email

1. They mail the body and images to a chosen address (for example `bugs@` on the owner's domain).
2. The mail Worker accepts it, pulls out images, and calls the main Worker's RPC "create a report". That enters the same Queue and Workflow as the form.
3. The receipt number goes back as a reply to that email.

### The developer replies

1. They open an unanswered row on `/` and go to `/reports/:id`.
2. They read the summary and similar past reports (title and receipt number). The screenshot is large on the detail page. The list shows only the thumbnail.
3. "Draft reply" fills the reply box gradually.
4. They edit and press send. The Workflow emails the reporter and the status becomes replied. If the report arrived by email, the message is a reply on that thread.
5. If it stays unanswered for several hours, the developer gets a "still unanswered" email.

### Publishing a known issue

When the developer marks a report as a known issue, its title and summary appear on `/known`. That page is cached. Drafts and unpublished reports stay off it.

## Processes

Each process has one blocking Go entry. The main process blocks on `hono.ServeMiddleware`. Durable Object, Workflow, RPC, and Queue consumer registration happen before that. `workers.Serve` is not used. The `_examples` pattern of registering handlers and then blocking on `workers.Serve` becomes a block on the Hono middleware. During implementation, check that Workflow and Durable Object triggers still run with that substitution, against the examples.

`email.Handle` and `tail.Handle` both register and block (`a38be307`; there is no public non-blocking register comparable to Queue's `ConsumeNonBlock`). Inbound mail and Tail are separate Workers. The main Worker uses only the send binding.

```text
reporter -- form --> bug-inbox (Hono + Go)
                       | Queue -> Workflow
                       | reply email, notice to the developer
reporter -- email --> bug-inbox-mail -- RPC --> bug-inbox
bug-inbox traces --> bug-inbox-tail --> KV (read by /admin)
```

| Process | Entry | Role |
| --- | --- | --- |
| `bug-inbox` | `hono.ServeMiddleware` | Form, inbox, report page, known issues, sending replies, Queue produce and consume, Durable Object, Workflow, RPC |
| `bug-inbox-mail` | `email.Handle` | Turn inbound mail into a report and reply with the receipt number |
| `bug-inbox-tail` | `tail.Handle` | Write the main Worker's traces to KV and show them on `/admin` |

Wrangler `main` does not use the generated `build/worker.mjs` `fetch` as-is. That fetch calls `handleRequest`, and the main Worker never starts `workers.Serve`. `js/index.mjs` owns the Hono routes, boots Wasm per request, and calls `binding.runHonoMiddleware(next)`. Route bodies call RPC `ReportService` through a service binding. `queue` and the generated Durable Object, Workflow, and `WorkerEntrypoint` classes are re-exported from `build/worker.mjs`.

Class names match across the `workers-assets-gen` flags, Go `Register`, and Wrangler `class_name` / `entrypoint`.

```text
go run github.com/syumai/workers-go/cmd/workers-assets-gen@<pin> \
  -mode=go \
  -runtime=cloudflare \
  -durable-objects=ReportRoom \
  -workflows=ProcessReport \
  -entrypoints=ReportService:create,draftReply,sendReply,markKnown
```

## Where each feature appears

`exp/internal/jsrt` is the helper generated bindings call internally, so it has no screen. `exp/internal/gen` is codegen input and is not deployed. `exp/deno` is out of scope.

D1, Workers Cron, and the direct Sockets API in stable `cloudflare/` are not product features. Sockets are used only behind `Hyperdrive.Connect` when Hyperdrive is turned on from `/admin`. Queue consumption uses stable `cloudflare/queues.ConsumeNonBlock` because `exp/cloudflare/queues` generates only the producer. Consumption exists so accepted work finishes. It is not a separate demo screen.

### On the report flow

| Package | Job in the product | Screen | Binding / resource |
| --- | --- | --- | --- |
| `exp/hono` | In front of every page. Developer pages require the shared secret. `/report` and `/known` do not. Rate limit and the `cf` read happen here | All | None. JS Hono owns the routes |
| `exp/cloudflare/ratelimit` | Stop repeat submits on the report form. Key is the IP | `/report` | Name the binding `REPORT` (not `CLIP`). Keep the limit per period small |
| `exp/cloudflare/cf` | Store which country and colo the report came from, and show that on the detail page | Report detail | None |
| `exp/cloudflare/kv` | Receipt number, status, summary, reporter address, known-issue flag | Inbox, detail, known issues | KV `REPORTS` |
| `exp/cloudflare/r2` | Original screenshot | Report detail | R2 `SHOTS`. Not used for the list |
| `exp/cloudflare/images` | One thumbnail size for the list | Inbox | Images `IMAGES`. Skip the step when there is no image |
| `exp/cloudflare/ai` | A short summary, and a draft streamed into the reply box | Summary and reply box on the detail page | AI `AI` |
| `exp/cloudflare/vectorize` | Similarity to past reports, shown with receipt numbers | Report detail | Index `SIMILAR`. Dimensions match the embedding model |
| `exp/cloudflare/queues` | Enqueue processing as soon as the form or email is accepted. `Send`. Backlog from `Metrics` is the inbox "waiting" count, not an admin chart | Just after accept, waiting count on the inbox | Producer `REPORT_JOBS` |
| `exp/cloudflare/workflows` | Thumbnail, summary, embedding, a first look at similar reports, and the notice email to the developer. `Sleep` is a short wait before that notice. `WaitForEvent` is the developer's send. Failures that leave the report unreadable use `NonRetryable` | From accept through reply | Binding `PROCESS`, class `ProcessReport` |
| `exp/cloudflare/analytics` | One point each for accepted, replied, and marked known, shown as today's count on the inbox | Inbox | Dataset `USAGE` |
| `exp/cloudflare/cache` | `match` / `put` the HTML for `/known` | Known issues | Cache API. No binding |
| `exp/cloudflare/websocket` | Stream draft-reply tokens with `Upgrade`. Return immediately after Upgrade; read and write on a goroutine | Reply box on the report detail | None |
| `exp/cloudflare/durableobjects` | One `ReportRoom` per report. Push "summary ready" to an open detail page. In-progress draft text lives in storage. `SQL().OpenDB()` is that report's history (accepted, summary ready, replied, marked known). The alarm is the unanswered notice | Report detail | DO `REPORT_ROOM`, SQLite migration |
| `exp/cloudflare/rpc` | `ReportService` methods `create`, `draftReply`, `sendReply`, `markKnown`. Called from Hono, the mail Worker, and the Workflow | Form, detail, mail intake | Service `REPORT_SERVICE`, entrypoint `ReportService`, bound to this Worker |
| `exp/cloudflare/email` | The main Worker sends (the receipt reply is the mail Worker; the new-report notice, the unanswered reminder, and the reply use `Send` / `Reply` on the main Worker or the mail Worker). Inbound uses `Handle` and `ForwardableEmailMessage` | Email, send on the report detail | `send_email` binding `EMAIL`. Email Routing delivers inbound mail to `bug-inbox-mail` |

`cf.FromRequest` works when the Hono middleware's `*http.Request` carries `request.cf`. Confirm that in the first implementation spike. If it does not, the JS side passes country and colo in headers.

The Durable Object hibernating WebSocket (`UpgradeHibernating` and `AcceptHibernatingConn`) is the connection that stays on an open report until the summary is ready. The draft reply streams tokens continuously, which does not suit hibernation, so that stream uses the plain `websocket.Upgrade`.

### On the admin screen

These do not appear while reading or answering a report. `/admin` shows whether each one is configured, plus recent Tail failures. The path from the form to a reply still works when they are unset.

| Package | What `/admin` shows | When unset |
| --- | --- | --- |
| `exp/cloudflare/versions` | id, tag, and timestamp of the running Worker | Binding name `CF_VERSION_METADATA`. The same line may also sit in the footer, but it is not why anyone opens the inbox |
| `exp/cloudflare/tail` | A separate Worker stores the main Worker's traces in KV so failed intakes and Workflows can be read | Without Tail, "recent failures" on `/admin` is empty. Sending and receiving reports still works |
| `exp/cloudflare/secretsstore` | Whether the signing key for an embeddable report form on another site can be read. The inbox shared secret stays a Wrangler secret, so secrets are not stored in two places | Do not build the embeddable form. `/report` still works |
| `exp/cloudflare/hyperdrive` | Whether Postgres for long-term report storage connects. Use `Connect` as a `database/sql` dialer | KV, R2, and ReportRoom SQLite are enough |
| `exp/cloudflare/dispatch` | Whether, before the summary, the body can be handed to a classifier Worker in the namespace via `GetClient` | Classification is Workers AI on the main Worker only |

## Directory layout

```text
bug-inbox/
  DESIGN.md                 # this PR is only this file
  README.md                 # at implementation time: how to use it
  go.mod                    # module github.com/syumai/workers-playground/bug-inbox
  go.sum
  package.json              # hono, wrangler
  wrangler.jsonc            # main Worker
  Makefile
  main.go                   # Register calls and hono.ServeMiddleware
  js/index.mjs              # Hono. Re-export generated classes
  mail/main.go              # email.Handle only
  mail/wrangler.jsonc
  tail/main.go              # tail.Handle only
  tail/wrangler.jsonc
```

One module. `mail` and `tail` are separate `main` packages.

## Build and pin

The latest tag `v0.36.0` (2026-09-21, `ba33a670`) has only `exp/hono` under `exp/`. `exp/cloudflare` and `exp/internal` are on `main` at `a38be307`. Until a tag contains them, require that commit.

```bash
go get github.com/syumai/workers-go@a38be30753a413b075ec7344faa6a26acb436d42
```

The pseudo-version Go writes should be `v0.36.1-0.20260923184945-a38be30753a4`, from the commit time (UTC 2026-09-23 18:49:45). At implementation time, keep whatever `go get` prints. Run `workers-assets-gen` at the same version with `go run ...@<that version>`. Use `replace` only while editing `workers-go` locally. Leave it out of the `go.mod` used to deploy.

The toolchain is Go 1.24 or newer (the `workers-go` README requirement; the module's `go` line is 1.21.3).

Build with `-mode=go`. Do not use TinyGo. Generated code uses generics, and the Durable Object SQL driver uses `database/sql`.

Use Wrangler 4. The template's `wrangler@3.109.2` does not match the schema needed for Workflows and SQLite-backed Durable Objects at implementation time. The keys below are intent. The installed Wrangler schema wins.

`compatibility_date` is `2026-10-24`. Do not add the older examples' `streams_enable_constructors` flag at this date.

Enable both logs and traces.

```jsonc
{
  "observability": {
    "enabled": true,
    "traces": { "enabled": true }
  }
}
```

The main Worker's `tail_consumers` points at `bug-inbox-tail`. Traces alone do not run the `exp/cloudflare/tail` handler.

As of the 2026-10-12 [Workers Limits](https://developers.cloudflare.com/workers/platform/limits/), the script size limit is 64 MiB uncompressed on both plans. Startup is 1 second. The Free plan allows 10 ms of CPU per request. Go Wasm startup plus AI, images, and Workflows will often exceed 10 ms. Deploy on Workers Paid. During implementation, check startup time and size with `wrangler check startup` and `wrangler deploy --dry-run --outdir`. `wrangler dev` does not depend on the plan.

## Config sketch

Do not commit secrets or production resource IDs. Decide at the start of implementation whether remote IDs go in `wrangler.jsonc`. Some playground examples commit real IDs. Bug Inbox keeps secrets and production IDs out of the repo.

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

For `/admin`. Sending and receiving reports still works when these are unset.

```jsonc
{
  "hyperdrive": [{ "binding": "ARCHIVE", "id": "<hyperdrive-config>" }],
  "dispatch_namespaces": [{ "binding": "CLASSIFIERS", "namespace": "bug-inbox-classifiers" }],
  "secrets_store_secrets": [{ "binding": "EMBED_KEY", "store_id": "<store>", "secret_name": "embed-hmac" }]
}
```

The mail Worker has `send_email` and a service binding `REPORT_SERVICE` to the main Worker. The Tail Worker uses the same KV `REPORTS`.

## Resources and cost

Keep the volume to the reports from one or two personal apps. Read each product's pricing page for included quota on the day of implementation.

| Resource | Role | Expectation |
| --- | --- | --- |
| Three Workers | Main, mail, Tail | Free includes 100,000 requests/day and 10 ms CPU. [Limits](https://developers.cloudflare.com/workers/platform/limits/) size is 64 MiB on both plans. Deploy assumes Paid |
| KV, R2 | Status and original screenshots | Both have a free allowance. Images go to R2 |
| Queue | Work immediately after accept | One message per report |
| Durable Object `ReportRoom` | The open report and the unanswered alarm | One object per report. The alarm is only the unanswered notice |
| Workflow `ProcessReport` | From accept until a reply can be sent | One instance per report |
| Workers AI | Summary, reply draft, embeddings | Billed in neurons. Pin one short-text model for each job |
| Vectorize | Similar reports | Vector count equals report count. Match dimensions to the embedding and do not raise them further |
| Analytics Engine | Today's count | Three kinds of points: accepted, replied, marked known |
| Rate Limit | Repeat submits on the form | One namespace |
| Cache API | `/known` | No extra resource to create |
| version metadata | `/admin` | No extra charge |
| Images | Thumbnails | Transformations can be metered. Fix one width |
| Email Routing and `send_email` | Intake and replies | Inbound mail is a zone feature. Limit recipients to the reporter and the developer. A domain is required |
| Secrets Store, Hyperdrive, Dispatch | Optional `/admin` items | Fine to skip. Dispatch needs an account that can use Workers for Platforms |

Do not create D1. `exp/` has no D1 package, and this inbox stores reports in KV, R2, and ReportRoom SQLite.

## Local development and deploy

`make dev` runs `wrangler dev`. KV, R2, Durable Objects, and Queues can be exercised locally through "submit the form and see the row in the inbox".

| Action | Where to look |
| --- | --- |
| Form, inbox, rate-limit rejection, `/known` cache | Local `curl` and a browser |
| Saving the screenshot, and a summary appearing on an already open report | Local simulation. AI itself is remote |
| AI, Vectorize, Images, Analytics | `wrangler dev --remote`, or after deploy, with one report |
| Email, Tail, Secrets Store, Hyperdrive, Dispatch | After deploy, and only for the ones that were created. If they were not created, confirm locally that `/admin` shows them as unset |

Steps: `go get` the pin and `npm install`, create the required resources, build the three Workers, accept one report with `wrangler dev`, then deploy `bug-inbox-tail`, `bug-inbox-mail`, and the main Worker in that order. Point Email Routing at the mail Worker. The first `tail_consumers` setup needs Tail deployed first.

## Keeping up with `exp`

`exp/cloudflare` gains and loses fields as workers-types changes. The inbox calls only the methods in the tables above.

This repo has no Renovate, Dependabot, or CI. Tracking stays inside `bug-inbox/`.

- When a tag includes `exp/cloudflare`, move the pseudo-version to that tag. Until then, Dependabot will not move the pin.
- After that tag, Dependabot updates only the `bug-inbox` gomod and npm packages (`hono`, `wrangler`), weekly.
- CI is `GOOS=js GOARCH=wasm go build` for the three Workers. It does not deploy.
- Weekly, build `@main` in a temporary module without changing the pin. A failure means main and the inbox have drifted. Do not rewrite `go.mod` automatically.
- Pass one version constant from the Makefile to both `workers-assets-gen` and the library require.

## Open questions

1. Is the name "Bug Inbox" and the directory `bug-inbox` right? Worker names would be `bug-inbox`, `bug-inbox-mail`, and `bug-inbox-tail`.
2. Is Workers Paid the right place to deploy?
3. Is one developer (the owner) and reporters with no login the right shape?
4. Which domain receives mail, and which address is notified? If there is no domain, defer the mail Worker and finish the inbox with the form only.
5. Should the known-issues page be public from the start? Until it is public, Cache is used only once at least one report is marked known.
6. Which Workers AI models summarize, draft replies, and embed? The dimensions decide the Vectorize index.
7. After how many hours should the unanswered reminder fire?
8. Should Secrets Store, Hyperdrive, and Dispatch stay optional `/admin` items?
9. Should inbound mail stay a separate Worker? Putting it in the same Worker needs a non-blocking email register in `workers-go` first.
10. Is the policy of not committing production resource IDs in `wrangler.jsonc` right?
11. Can `cf.FromRequest` read `request.cf` from the Hono middleware's `*http.Request`? Decide in the first spike.
