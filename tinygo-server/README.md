# tinygo-server

* A simple HTTP JSON server implemented in Go and compiled with tinygo.

## Example

* https://tinygo-server.syumai.workers.dev

### Request

```
curl --location --request POST 'https://tinygo-server.syumai.workers.dev' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "syumai"
}'
```

### Response

```json
{
    "message": "Hello, syumai!"
}
```

## Development

### Requirements

* tinygo
* [easyjson](https://github.com/mailru/easyjson)
  - `go install github.com/mailru/easyjson/...@latest`

### Commands

```
npm start  # run local server
make build # build Go Wasm binary
```

## Author

syumai

## License

MIT
