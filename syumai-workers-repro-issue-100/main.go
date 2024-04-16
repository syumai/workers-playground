package main

import (
	"net/http"

	"github.com/syumai/workers"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, req *http.Request) {
		// doing nothing here causes weird error
	})
	workers.Serve(nil) // use http.DefaultServeMux
}
