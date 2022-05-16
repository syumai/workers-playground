//go:generate easyjson .
package app

import (
	"fmt"
	"net/http"
	"os"

	"github.com/mailru/easyjson"
)

//easyjson:json
type HelloRequest struct {
	Name string `json:"name"`
}

//easyjson:json
type HelloResponse struct {
	Message string `json:"message"`
}

func HelloHandler(w http.ResponseWriter, req *http.Request) {
	var helloReq HelloRequest
	if err := easyjson.UnmarshalFromReader(req.Body, &helloReq); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Header().Set("Content-Type", "text/plain")
		w.Write([]byte("request format is invalid"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	msg := fmt.Sprintf("Hello, %s!", helloReq.Name)
	helloRes := HelloResponse{Message: msg}

	if _, err := easyjson.MarshalToWriter(&helloRes, w); err != nil {
		fmt.Fprintf(os.Stderr, "failed to encode response: %w\n", err)
	}
}
