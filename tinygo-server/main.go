//go:generate tinygo build -o dist/app.wasm -target wasm ./main.go
package main

import (
	"net/http"

	"github.com/syumai/workers-playground/tinygo/app"
	"github.com/syumai/workers-playground/tinygo/jshttp"
)

func main() {
	jshttp.Serve(http.HandlerFunc(app.HelloHandler))
}
