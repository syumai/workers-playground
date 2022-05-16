package jshttp

import (
	"bytes"
	"io"
	"net/http"
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

func (w responseWriterBuffer) toResponse() *http.Response {
	statusCode := w.statusCode
	if statusCode == 0 {
		statusCode = http.StatusOK
	}
	return &http.Response{
		Status:     http.StatusText(w.statusCode),
		StatusCode: w.statusCode,
		Header:     w.header,
		Body:       io.NopCloser(w.buf),
	}
}
