# go-date-example

- A worker to test `time.Now()` result.

## Development

### Commands

```
make dev     # run dev server
make build   # build Go Wasm binary
make deploy # deploy worker
```

### Testing dev server

- Just send HTTP request using some tools like curl.

```
$ curl http://localhost:8787/now
2024-01-01 23:44:54.185 +0900 UTC+9 m=+0.016000001
```
