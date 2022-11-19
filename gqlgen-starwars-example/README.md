# gqlgen-starwars-example

- Cloudflare Worker example implemented in Go and [gqlgen](https://github.com/99designs/gqlgen).
    - Server implementation is copied from [gqlgen example](https://github.com/99designs/gqlgen/tree/v0.17.20/_examples/starwars).

## Demo

- https://gqlgen-starwars-example.syumai.workers.dev/

## Development

### Commands

```
make dev     # run dev server
make build   # build Go Wasm binary
make publish # publish worker
```

### Testing dev server

open `localhost:8787` in browser.

example query

```graphql
query Starships {
    starship(id: "3000") {
        id
        name
        length
        history
    }
}
```
