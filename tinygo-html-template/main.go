package main

import (
	"html/template"
	"net/http"

	"github.com/syumai/workers"
)

func main() {
	http.HandleFunc("/test", func(w http.ResponseWriter, r *http.Request) {
		tmpl, _ := template.New("foo").Parse(`<div>{{.CounterValue}}</div>`)

		data := map[string]int{
			"CounterValue": 10,
		}
		_ = tmpl.ExecuteTemplate(w, "foo", data)
	})
	workers.Serve(nil) // use http.DefaultServeMux
}
