package jsutil

import (
	"fmt"
	"syscall/js"
)

var PromiseClass = js.Global().Get("Promise")

func NewPromise(fn js.Func) js.Value {
	return PromiseClass.New(fn)
}

func AwaitPromise(promiseVal js.Value) (js.Value, error) {
	resultCh := make(chan js.Value)
	errCh := make(chan error)
	var then, catch js.Func
	then = js.FuncOf(func(_ js.Value, args []js.Value) any {
		defer then.Release()
		result := args[0]
		resultCh <- result
		return js.Undefined()
	})
	catch = js.FuncOf(func(_ js.Value, args []js.Value) any {
		defer catch.Release()
		result := args[0]
		errCh <- fmt.Errorf("failed on promise: %s", result.Call("toString").String())
		return js.Undefined()
	})
	promiseVal.Call("then", then).Call("catch", catch)
	select {
	case result := <-resultCh:
		return result, nil
	case err := <-errCh:
		return js.Value{}, err
	}
}
