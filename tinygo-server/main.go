package main

import (
	"net/http"

	"github.com/syumai/workers-playground/tinygo-server/app"
	"github.com/syumai/workers-playground/tinygo-server/workers"
)

func main() {
	workers.Serve(http.HandlerFunc(app.HelloHandler))
}
