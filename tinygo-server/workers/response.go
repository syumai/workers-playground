package workers

import (
	"io"
	"net/http"
	"syscall/js"
)

func toJSHeader(header http.Header) js.Value {
	h := headersClass.New()
	for key, values := range header {
		for _, value := range values {
			h.Call("append", key, value)
		}
	}
	return h
}

func toJSResponse(body io.ReadCloser, status int, header http.Header) (js.Value, error) {
	if status == 0 {
		status = http.StatusOK
	}
	respInit := newObject()
	respInit.Set("status", status)
	respInit.Set("statusText", http.StatusText(status))
	respInit.Set("headers", toJSHeader(header))
	readableStream := convertReaderToReadableStream(body)
	return responseClass.New(readableStream, respInit), nil
}
