# tinygo-date-example

- A worker to test `time.Now()` result.

## Example

```
$ curl https://tinygo-date-example.syumai.workers.dev/now
2024-01-01 14:45:50.945 +0000 UTC+0 m=+0.000000001
```

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
