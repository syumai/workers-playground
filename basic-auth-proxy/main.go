package main

import (
	"context"
	"io"
	"net"
	"net/http"

	"github.com/alphahorizonio/tinynet/pkg/tinynet"
	"github.com/syumai/workers"
)

const (
	userName     = "user"
	userPassword = "password"
)

type wrappedConn struct {
	tinynet.Conn
}

func (c *wrappedConn) LocalAddr() net.Addr {
	return c.Conn.LocalAddr()
}

func (c *wrappedConn) RemoteAddr() net.Addr {
	return c.Conn.LocalAddr()
}

var transport = &http.Transport{
	Proxy: http.ProxyFromEnvironment,
	DialContext: func(ctx context.Context, network, addr string) (net.Conn, error) {
		conn, err := tinynet.Dial(network, addr)
		if err != nil {
			return nil, err
		}
		return &wrappedConn{conn}, nil
	},
	ForceAttemptHTTP2: false,
	MaxIdleConns:      100,
}

var client = http.Client{
	Transport: transport,
}

func authenticate(req *http.Request) bool {
	username, password, ok := req.BasicAuth()
	return ok && username == userName && password == userPassword
}

func handleRequest(w http.ResponseWriter, req *http.Request) {
	if !authenticate(req) {
		w.Header().Add("WWW-Authenticate", `Basic realm="login is required"`)
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte("Unauthorized\n"))
		return
	}
	resp, err := client.Do(req)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("InternalServerError\n"))
		return
	}
	io.Copy(w, resp.Body)
}

func main() {
	workers.Serve(http.HandlerFunc(handleRequest))
}
