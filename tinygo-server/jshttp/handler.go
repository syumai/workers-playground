package jshttp

import (
	"syscall/js"
)

// handleRequest accepts a Request object and returns Response object.
func handleRequest(req js.Value) any {
	if len(args) != 1 {
		panic("too many args given to handleRequest")
	}
	req, err := ToRequest(args[0])
	if err != nil {
		panic(err)
	}
	srv := &Server{ Handler: }
	return nil
}
