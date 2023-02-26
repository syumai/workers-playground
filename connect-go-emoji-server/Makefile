.PHONY: dev
dev:
	wrangler dev

.PHONY: build
build:
	mkdir -p dist
	GOOS=js GOARCH=wasm go build -o ./dist/app.wasm .

.PHONY: publish
publish:
	wrangler publish
