.PHONY: dev
dev:
	npx wrangler@wasm dev

.PHONY: build
build:
	mkdir -p dist
	tinygo build -o dist/app.wasm -wasm-abi=generic -target=wasi ./main.go

.PHONY: publish
publish:
	npx wrangler@wasm publish

