# tinygo-echo-wasi

- An example WASI app runnning Go app compiled with tinygo on Cloudflare Workers.

## Demo

```
echo 'hello, tinygo WASI worker!' | curl -X POST --data-binary @- https://tinygo-echo-wasi.syumai.workers.dev/ --output -
```

## Development

### Requirements

- tinygo

### Commands

```
# start dev server
$ make dev

# generate Wasm
$ make build

# make request to dev server
echo 'hey' | curl -X POST --data-binary @- http://localhost:8787/ --output -
```
