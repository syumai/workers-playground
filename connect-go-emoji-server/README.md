# connect-go-emoji-server

* Simple web server which returns emoji from name.
* This project requires paid plan of Cloudflare Workers.
  - See: [worker-template-go](https://github.com/syumai/worker-template-go).

## Demo

* `https://emoji.syum.ai`

### cURL

```console
$ curl -s -H 'Content-Type: application/json' \
https://emoji.syum.ai/emoji.v1.EmojiService/GetEmoji \
-d '{"short_name": "star"}' | gzip -d | jq .
{
  "emoji": {
    "shortName": "star",
    "emoji": "⭐"
  }
}
```

### HTTPie

```console
$ https post emoji.syum.ai/emoji.v1.EmojiService/GetEmoji short_name=apple | gzip -d | jq .
{
  "emoji": {
    "shortName": "apple",
    "emoji": "🍎"
  }
}
```


## Development

### Commands

```
make dev     # run dev server
make build   # build Go Wasm binary
make publish # publish worker
```


## License

MIT

## Author

syumai

