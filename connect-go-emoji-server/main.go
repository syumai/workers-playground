package main

import (
	"context"
	"errors"
	"net/http"

	"github.com/bufbuild/connect-go"
	"github.com/syumai/emo"
	"github.com/syumai/workers"
	emojiv1 "github.com/syumai/workers-playground/connect-go-emoji-server/gen/emoji/v1"
	"github.com/syumai/workers-playground/connect-go-emoji-server/gen/emoji/v1/emojiv1connect"
)

type EmojiServer struct{}

var _ emojiv1connect.EmojiServiceHandler = (*EmojiServer)(nil)

func (e EmojiServer) GetEmoji(ctx context.Context, req *connect.Request[emojiv1.GetEmojiRequest]) (*connect.Response[emojiv1.GetEmojiResponse], error) {
	foundEmoji := emo.Get(req.Msg.GetShortName())
	if foundEmoji == nil {
		return nil, connect.NewError(connect.CodeNotFound, errors.New("emoji not found"))
	}
	return connect.NewResponse(&emojiv1.GetEmojiResponse{
		Emoji: &emojiv1.Emoji{
			ShortName: foundEmoji.ShortName,
			Emoji:     foundEmoji.String(),
		},
	}), nil
}

func main() {
	srv := &EmojiServer{}
	path, handler := emojiv1connect.NewEmojiServiceHandler(srv)
	http.Handle(path, handler)
	workers.Serve(nil)
}
