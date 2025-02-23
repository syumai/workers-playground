# worker-template-go

- A template for starting a Cloudflare Worker project with Go.
- This template uses [`workers`](https://github.com/syumai/workers) package to run an HTTP server.

## Notice

- A free plan Cloudflare Workers only accepts ~1MB sized workers.
  - Go Wasm binaries easily exceeds this limit, so **you'll need to use a paid plan of Cloudflare Workers** (which accepts ~5MB sized workers).

## Usage

- `main.go` includes simple HTTP server implementation. Feel free to edit this code and implement your own HTTP server.

## Requirements

- Node.js
- Go 1.21.0 or later

## Getting Started

* Create a new worker project using this template.

```console
npm create cloudflare@latest -- --template github.com/syumai/workers/_templates/cloudflare/worker-go
```

* Initialize a project.

```console
cd my-app
go mod init
npm run dev # start running dev server
curl http://localhost:8787/hello # outputs "Hello!"
```

## Development

### Commands

```
npm run dev     # run dev server
# or
go run .        # run dev server without Wrangler (Cloudflare-related features are not available)
npm run build   # build Go Wasm binary
npm run deploy  # deploy worker
```

### Testing dev server

- Just send HTTP request using some tools like curl.

```
$ curl http://localhost:8787/hello
Hello!
```

```
$ curl -X POST -d "test message" http://localhost:8787/echo
test message
```
