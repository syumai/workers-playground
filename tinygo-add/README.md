# tinygo-add

* An example app runnning Go app compiled with tinygo on Cloudflare Workers.

## Demo

* https://tinygo-add.syumai.workers.dev/?a=3&b=5

## Development

### Requirements

* tinygo

### Commands

```
# start dev server
$ npm start

# generate Wasm
# This will be automatically triggered when npm start runs.
$ go generate 

# run app (add 2 numbers)
$ curl -s "http://localhost:8787/?a=2&b=10"
2 + 10 = 12
```
