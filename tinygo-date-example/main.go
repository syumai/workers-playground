package main

import (
	"net/http"
	"syscall/js"
	"time"

	"github.com/syumai/workers"
)

func main() {
	http.HandleFunc("/now", func(w http.ResponseWriter, req *http.Request) {
		w.Write([]byte(time.Now().String()))
	})
	http.HandleFunc("/date", func(w http.ResponseWriter, req *http.Request) {
		ms := js.Global().Get("Date").Call("now").Float()
		now := time.UnixMilli(int64(ms))
		w.Write([]byte(now.String()))
	})
	workers.Serve(nil) // use http.DefaultServeMux
}
