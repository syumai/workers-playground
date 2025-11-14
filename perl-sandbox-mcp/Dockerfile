FROM docker.io/cloudflare/sandbox:0.4.18

# Install Perl
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    perl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# On a Mac with Apple Silicon, you might need to specify the platform:
# FROM --platform=linux/arm64 docker.io/cloudflare/sandbox:0.4.18

# Required during local development to access exposed ports
EXPOSE 8080
