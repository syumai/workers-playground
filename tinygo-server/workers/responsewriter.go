package workers

import (
	"io"
	"net/http"
	"syscall/js"
)

type responseWriterBuffer struct {
	header     http.Header
	statusCode int
	*io.PipeReader
	*io.PipeWriter
}

var _ http.ResponseWriter = &responseWriterBuffer{}

func (w responseWriterBuffer) Header() http.Header {
	return w.header
}

func (w responseWriterBuffer) WriteHeader(statusCode int) {
	w.statusCode = statusCode
}

func (w responseWriterBuffer) toJSResponse() (js.Value, error) {
	return toJSResponse(w.PipeReader, w.statusCode, w.header)
}
