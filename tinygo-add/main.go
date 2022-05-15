//go:generate tinygo build -o dist/app.wasm -target wasm ./main.go
package main

//export add
func add(a, b int) int {
	return a + b
}

func main() {}
