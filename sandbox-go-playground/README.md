# Go Sandbox Example

A Cloudflare Worker that demonstrates the core capabilities of the Sandbox SDK to execute Go code.

## How It Works

This example provides a single endpoint:

1. **`/run`** - Executes Go code and returns the output

## Demo

* https://sandbox-go-playground.syumai.workers.dev/run

## API Endpoints

### Execute Go Code

```bash
GET http://localhost:8787/run
```

Runs `go run /workspace/main.go` and returns:

```json
{
  "output": "Hello, World! 2025-11-11T12:00:00Z\n",
  "success": true
}
```

## Setup

1. From the project root, run:

```bash
npm install
npm run build
```

2. Run locally:

```bash
cd examples/minimal # if you're not already here
npm run dev
```

The first run will build the Docker container (2-3 minutes). Subsequent runs are much faster.

## Testing

```bash
# Test command execution
curl http://localhost:8787/run
```

## Deploy

```bash
npm run deploy
```

After first deployment, wait 2-3 minutes for container provisioning before making requests.

## Next Steps

This minimal example is the starting point for more complex applications. See the [Sandbox SDK documentation](https://developers.cloudflare.com/sandbox/) for:

- Advanced command execution and streaming
- Background processes
- Preview URLs for exposed services
- Custom Docker images
