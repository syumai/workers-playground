package jshttp

import (
	"bytes"
	"net/http"
)

type Server struct {
	Handler http.Handler
}

func (s *Server) Serve(req *http.Request) *http.Response {
	var buf bytes.Buffer
	w := &responseWriterBuffer{
		header:     http.Header{},
		statusCode: http.StatusOK,
		buf:        &buf,
	}
	s.Handler.ServeHTTP(w, req)
	return w.toResponse()
}
