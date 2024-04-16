# syumai-workers-repro-issue-100

* A reproduction code of https://github.com/syumai/workers/issues/100

## Reproduction code

* A HandlerFunc without writing response body causes weird error.

```go
func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, req *http.Request) {
		// doing nothing here causes weird error
	})
	workers.Serve(nil) // use http.DefaultServeMux
}
```

## How to reproduce

```
$ make dev # run this command in another terminal
$ curl localhost:8787
TypeError: Cannot read properties of undefined (reading 'exports')
    at syscall/js.valueNew (file:///home/syumai/go/src/github.com/syumai/workers-playground/syumai-workers-repro-issue-100/build/wasm_exec.js:395:24)
    at [object Object]
    at [object Object]
    at [object Object]
    at [object Object]
    at [object Object]
    at globalThis.Go._resume (file:///home/syumai/go/src/github.com/syumai/workers-playground/syumai-workers-repro-issue-100/build/wasm_exec.js:553:23)
    at Object.handleRequest (file:///home/syumai/go/src/github.com/syumai/workers-playground/syumai-workers-repro-issue-100/build/wasm_exec.js:564:8)
    at Object.fetch (file:///home/syumai/go/src/github.com/syumai/workers-playground/syumai-workers-repro-issue-100/build/shim.mjs:51:18)
    at async jsonError (file:///home/syumai/.nvm/versions/node/v20.12.2/lib/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts:22:10)
```

