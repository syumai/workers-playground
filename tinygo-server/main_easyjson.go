// TEMPORARY AUTOGENERATED FILE: easyjson stub code to make the package
// compilable during generation.

package  main

import (
  "github.com/mailru/easyjson/jwriter"
  "github.com/mailru/easyjson/jlexer"
)

func ( HelloRequest ) MarshalJSON() ([]byte, error) { return nil, nil }
func (* HelloRequest ) UnmarshalJSON([]byte) error { return nil }
func ( HelloRequest ) MarshalEasyJSON(w *jwriter.Writer) {}
func (* HelloRequest ) UnmarshalEasyJSON(l *jlexer.Lexer) {}

type EasyJSON_exporter_HelloRequest *HelloRequest

func ( HelloResponse ) MarshalJSON() ([]byte, error) { return nil, nil }
func (* HelloResponse ) UnmarshalJSON([]byte) error { return nil }
func ( HelloResponse ) MarshalEasyJSON(w *jwriter.Writer) {}
func (* HelloResponse ) UnmarshalEasyJSON(l *jlexer.Lexer) {}

type EasyJSON_exporter_HelloResponse *HelloResponse