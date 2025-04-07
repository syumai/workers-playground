package main

import (
	"bytes"
	"io"
	"net/http"

	"github.com/syumai/workers"
)

func withCORS(handler http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		handler(w, r)
	}
}

func main() {
	http.HandleFunc("/hello", withCORS(func(w http.ResponseWriter, r *http.Request) {
		msg := "Hello!"
		w.Write([]byte(msg))
	}))
	http.HandleFunc("/echo", withCORS(func(w http.ResponseWriter, req *http.Request) {
		b, err := io.ReadAll(req.Body)
		if err != nil {
			panic(err)
		}
		io.Copy(w, bytes.NewReader(b))
	}))
	workers.Serve(nil) // use http.DefaultServeMux
}
