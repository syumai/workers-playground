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
	b, err := io.ReadAll(body)
	if err != nil {
		return js.Value{}, err
	}
	ua := newUint8Array(len(b))
	_ = js.CopyBytesToJS(ua, b)
	ary := arrayClass.New()
	ary.Call("push", ua.Get("buffer"))
	blob := blobClass.New(ary)
	return responseClass.New(blob, respInit), nil
}
