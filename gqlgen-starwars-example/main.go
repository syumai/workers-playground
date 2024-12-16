package main

import (
	"context"
	"net/http"

	"github.com/99designs/gqlgen/_examples/starwars"
	"github.com/99designs/gqlgen/_examples/starwars/generated"
	"github.com/99designs/gqlgen/graphql"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/syumai/workers"
)

func main() {
	srv := handler.NewDefaultServer(generated.NewExecutableSchema(starwars.NewResolver()))
	srv.AroundFields(func(ctx context.Context, next graphql.Resolver) (res interface{}, err error) {
		res, err = next(ctx)
		return res, err
	})

	http.Handle("/query", srv)

	workers.Serve(nil)
}
