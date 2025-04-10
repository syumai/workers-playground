package main

import (
	"bytes"
	"image/png"
	"io"
	"math/rand/v2"
	"net/http"
	"strings"

	"github.com/lucasb-eyer/go-colorful"
	"github.com/syumai/syumaigen"
	"github.com/syumai/workers"
)

func generateRandomColorCode() string {
	h := rand.Float64() * 360.0
	c := 0.4 + rand.Float64()*0.6
	l := 0.5
	return strings.TrimLeft(colorful.Hcl(h, c, l).Hex(), "#")
}

func writePNG(w http.ResponseWriter, cMap syumaigen.ColorMap, scale int) {
	w.Header().Set("Content-Type", "image/png")
	img, _ := syumaigen.GenerateImage(
		syumaigen.Pattern,
		cMap,
		scale,
	)
	var buf bytes.Buffer
	png.Encode(&buf, img)
	io.Copy(w, &buf)
}

func main() {
	http.HandleFunc("/generate", func(w http.ResponseWriter, req *http.Request) {
		code := generateRandomColorCode()
		cMap := syumaigen.GenerateColorMapByColorCode(code)
		scale := 10
		writePNG(w, cMap, scale)
	})
	workers.Serve(nil) // use http.DefaultServeMux
}
