package main

import (
	"net/http"

	"github.com/syumai/workers-playground/tinygo/app"
	"github.com/syumai/workers-playground/tinygo/workers"
)

func main() {
	workers.Serve(http.HandlerFunc(app.HelloHandler))
}
