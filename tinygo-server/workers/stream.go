package workers

import (
	"bytes"
	"fmt"
	"io"
	"syscall/js"
)

// streamReaderToReader implements io.Reader sourced from ReadableStreamDefaultReader.
type streamReaderToReader struct {
	buf          bytes.Buffer
	streamReader js.Value
}

// Read reads bytes from ReadableStreamDefaultReader.
// * ReadableStreamDefaultReader: https://developer.mozilla.org/en-US/docs/Web/API/ReadableStreamDefaultReader
// * This implementation is based on: https://deno.land/std@0.139.0/streams/conversion.ts#L76
func (sr *streamReaderToReader) Read(p []byte) (n int, err error) {
	if sr.buf.Len() == 0 {
		promise := sr.streamReader.Call("read")
		resultCh := make(chan js.Value)
		errCh := make(chan error)
		var then, catch js.Func
		then = js.FuncOf(func(_ js.Value, args []js.Value) interface{} {
			defer then.Release()
			result := args[0]
			if result.Get("done").Bool() {
				errCh <- io.EOF
				return js.Undefined()
			}
			resultCh <- result.Get("value")
			return js.Undefined()
		})
		catch = js.FuncOf(func(_ js.Value, args []js.Value) interface{} {
			defer catch.Release()
			result := args[0]
			errCh <- fmt.Errorf("JavaScript error on read: %s", result.Call("toString").String())
			return js.Undefined()
		})
		promise.Call("then", then).Call("catch", catch)
		select {
		case result := <-resultCh:
			chunk := make([]byte, result.Get("byteLength").Int())
			_ = js.CopyBytesToGo(chunk, result)
			// The length written is always the same as the length of chunk, so it can be discarded.
			// - https://pkg.go.dev/bytes#Buffer.Write
			_, err := sr.buf.Write(chunk)
			if err != nil {
				return 0, err
			}
		case err := <-errCh:
			return 0, err
		}
	}
	return sr.buf.Read(p)
}

// convertStreamReaderToReader converts ReadableStreamDefaultReader to io.Reader.
func convertStreamReaderToReader(sr js.Value) io.Reader {
	return &streamReaderToReader{
		streamReader: sr,
	}
}

// readerToStreamReader implements ReadableStreamDefaultReader sourced from io.ReadCloser.
type readerToStreamReader struct {
	buf        bytes.Buffer
	readCloser io.ReadCloser
}

// WIP
