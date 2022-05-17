package main

import (
	"net/http"

	"github.com/syumai/workers-playground/tinygo-server/app"
	"github.com/syumai/workers-playground/tinygo-server/workers"
)

func main() {
	http.HandleFunc("/hello", app.HelloHandler)
	workers.Serve(nil) // use http.DefaultServeMux
}
