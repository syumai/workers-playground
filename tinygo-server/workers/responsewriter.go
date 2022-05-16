package workers

import (
	"bytes"
	"io"
	"net/http"
	"syscall/js"
)

type responseWriterBuffer struct {
	header     http.Header
	statusCode int
	buf        *bytes.Buffer
}

var _ http.ResponseWriter = &responseWriterBuffer{}

func (w responseWriterBuffer) Header() http.Header {
	return w.header
}

func (w responseWriterBuffer) Write(p []byte) (int, error) {
	return w.buf.Write(p)
}

func (w responseWriterBuffer) WriteHeader(statusCode int) {
	w.statusCode = statusCode
}

func (w responseWriterBuffer) toJSResponse() (js.Value, error) {
	return toJSResponse(io.NopCloser(w.buf), w.statusCode, w.header)
}
