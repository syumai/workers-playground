package main

import (
	"net/http"
	"time"

	"github.com/syumai/workers"
)

func main() {
	http.HandleFunc("/now", func(w http.ResponseWriter, req *http.Request) {
		w.Write([]byte(time.Now().String()))
	})
	workers.Serve(nil) // use http.DefaultServeMux
}
