FROM docker.io/cloudflare/sandbox:0.4.18

# Add the Go PPA and install Go 1.25
# see: https://go.dev/wiki/Ubuntu
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    software-properties-common gnupg && \
    add-apt-repository ppa:longsleep/golang-backports && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
    golang-1.25-go && \
    apt-get remove -y software-properties-common gnupg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN ln -s /usr/lib/go-1.25/bin/go /usr/bin/go

# On a Mac with Apple Silicon, you might need to specify the platform:
# FROM --platform=linux/arm64 docker.io/cloudflare/sandbox:0.4.18

# Required during local development to access exposed ports
EXPOSE 8080
