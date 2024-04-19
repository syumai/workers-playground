// based on: https://github.com/syumai/workers/issues/103 by @eliezedeck
package main

import (
	"bytes"
	"compress/flate"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/klauspost/compress/zip"
	"github.com/labstack/echo/v4"
	"github.com/syumai/workers"
	"github.com/syumai/workers/cloudflare"
)

func main() {
	bucket, err := cloudflare.NewR2Bucket("DOCUMENTS")
	if err != nil {
		log.Fatalf("Error creating Cloudflare R2 bucket: %s", err)
	}

	e := echo.New()

	e.GET("/services/stream-zip-from-r2", func(c echo.Context) error {
		// Start streaming
		c.Response().Header().Set(echo.HeaderContentType, "application/zip")
		c.Response().Header().Set(echo.HeaderContentDisposition, "attachment; filename=example.zip")
		c.Response().WriteHeader(http.StatusOK)

		// Prepare to stream a ZIP file from R2
		var zipBuf bytes.Buffer
		writer := zip.NewWriter(&zipBuf)
		writer.RegisterCompressor(zip.Deflate, func(out io.Writer) (io.WriteCloser, error) {
			return flate.NewWriter(out, flate.NoCompression)
		})

		files := []string{
			"akiba.jpg",
			"text1.txt",
			"text2.txt",
			"text3.txt",
			"text4.txt",
			"text5.txt",
		}
		for _, file := range files {
			fmt.Println("run: ", file)
			// Get the file from R2
			obj, err := bucket.Get(file)
			if err != nil {
				c.Logger().Errorf("failed to get file '%s' from R2: %v", file, err)
				return err
			}
			if obj == nil {
				c.Logger().Errorf("file '%s' is nil", file)
				return nil
			}
			fileWriter, err := writer.Create(file)
			if err != nil {
				c.Logger().Errorf("failed to create file '%s' in ZIP: %v", file, err)
				return err
			}

			if _, err := io.Copy(fileWriter, obj.Body); err != nil {
				c.Logger().Errorf("failed to copy file '%s' from R2: %v", file, err)
				return err
			}
		}
		if err := writer.Flush(); err != nil {
			c.Logger().Errorf("Error flushing zip writer: %s", err)
		}
		if err := writer.Close(); err != nil {
			c.Logger().Errorf("failed to close ZIP writer: %v", err)
		}
		if _, err := io.Copy(c.Response(), &zipBuf); err != nil {
			c.Logger().Error("failed to copy zip from buffer")
			return err
		}
		return nil
	})
	workers.Serve(e)
}
