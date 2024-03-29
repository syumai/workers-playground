// Code generated by protoc-gen-connect-go. DO NOT EDIT.
//
// Source: emoji/v1/emoji.proto

package emojiv1connect

import (
	context "context"
	errors "errors"
	connect_go "github.com/bufbuild/connect-go"
	v1 "github.com/syumai/workers-playground/connect-go-emoji-server/gen/emoji/v1"
	http "net/http"
	strings "strings"
)

// This is a compile-time assertion to ensure that this generated file and the connect package are
// compatible. If you get a compiler error that this constant is not defined, this code was
// generated with a version of connect newer than the one compiled into your binary. You can fix the
// problem by either regenerating this code with an older version of connect or updating the connect
// version compiled into your binary.
const _ = connect_go.IsAtLeastVersion0_1_0

const (
	// EmojiServiceName is the fully-qualified name of the EmojiService service.
	EmojiServiceName = "emoji.v1.EmojiService"
)

// EmojiServiceClient is a client for the emoji.v1.EmojiService service.
type EmojiServiceClient interface {
	GetEmoji(context.Context, *connect_go.Request[v1.GetEmojiRequest]) (*connect_go.Response[v1.GetEmojiResponse], error)
}

// NewEmojiServiceClient constructs a client for the emoji.v1.EmojiService service. By default, it
// uses the Connect protocol with the binary Protobuf Codec, asks for gzipped responses, and sends
// uncompressed requests. To use the gRPC or gRPC-Web protocols, supply the connect.WithGRPC() or
// connect.WithGRPCWeb() options.
//
// The URL supplied here should be the base URL for the Connect or gRPC server (for example,
// http://api.acme.com or https://acme.com/grpc).
func NewEmojiServiceClient(httpClient connect_go.HTTPClient, baseURL string, opts ...connect_go.ClientOption) EmojiServiceClient {
	baseURL = strings.TrimRight(baseURL, "/")
	return &emojiServiceClient{
		getEmoji: connect_go.NewClient[v1.GetEmojiRequest, v1.GetEmojiResponse](
			httpClient,
			baseURL+"/emoji.v1.EmojiService/GetEmoji",
			opts...,
		),
	}
}

// emojiServiceClient implements EmojiServiceClient.
type emojiServiceClient struct {
	getEmoji *connect_go.Client[v1.GetEmojiRequest, v1.GetEmojiResponse]
}

// GetEmoji calls emoji.v1.EmojiService.GetEmoji.
func (c *emojiServiceClient) GetEmoji(ctx context.Context, req *connect_go.Request[v1.GetEmojiRequest]) (*connect_go.Response[v1.GetEmojiResponse], error) {
	return c.getEmoji.CallUnary(ctx, req)
}

// EmojiServiceHandler is an implementation of the emoji.v1.EmojiService service.
type EmojiServiceHandler interface {
	GetEmoji(context.Context, *connect_go.Request[v1.GetEmojiRequest]) (*connect_go.Response[v1.GetEmojiResponse], error)
}

// NewEmojiServiceHandler builds an HTTP handler from the service implementation. It returns the
// path on which to mount the handler and the handler itself.
//
// By default, handlers support the Connect, gRPC, and gRPC-Web protocols with the binary Protobuf
// and JSON codecs. They also support gzip compression.
func NewEmojiServiceHandler(svc EmojiServiceHandler, opts ...connect_go.HandlerOption) (string, http.Handler) {
	mux := http.NewServeMux()
	mux.Handle("/emoji.v1.EmojiService/GetEmoji", connect_go.NewUnaryHandler(
		"/emoji.v1.EmojiService/GetEmoji",
		svc.GetEmoji,
		opts...,
	))
	return "/emoji.v1.EmojiService/", mux
}

// UnimplementedEmojiServiceHandler returns CodeUnimplemented from all methods.
type UnimplementedEmojiServiceHandler struct{}

func (UnimplementedEmojiServiceHandler) GetEmoji(context.Context, *connect_go.Request[v1.GetEmojiRequest]) (*connect_go.Response[v1.GetEmojiResponse], error) {
	return nil, connect_go.NewError(connect_go.CodeUnimplemented, errors.New("emoji.v1.EmojiService.GetEmoji is not implemented"))
}
