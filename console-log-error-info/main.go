package main

import (
	"fmt"
	"net/http"
	"syscall/js"

	"github.com/syumai/workers"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, req *http.Request) {
		v := js.Global().Get("Error").New("error")
		fmt.Printf("err in printf: %#v\n", v)
		js.Global().Get("console").Call("log", "err in console: ", v)
		msg := "Hello!"
		w.Write([]byte(msg))
	})
	workers.Serve(nil) // use http.DefaultServeMux
}
