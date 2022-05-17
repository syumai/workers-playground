package workers

import "syscall/js"

var (
	global              = js.Global()
	objectClass         = global.Get("Object")
	promiseClass        = global.Get("Promise")
	responseClass       = global.Get("Response")
	headersClass        = global.Get("Headers")
	arrayClass          = global.Get("Array")
	uint8ArrayClass     = global.Get("Uint8Array")
	errorClass          = global.Get("Error")
	readableStreamClass = global.Get("ReadableStream")
)

func newObject() js.Value {
	return objectClass.New()
}

func newUint8Array(size int) js.Value {
	return uint8ArrayClass.New(size)
}

func newPromise(fn js.Func) js.Value {
	return promiseClass.New(fn)
}

// arrayFrom calls Array.from to given argument and returns result Array.
func arrayFrom(v js.Value) js.Value {
	return arrayClass.Call("from", v)
}
