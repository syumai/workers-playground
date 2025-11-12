# go-sandbox-mcp

A Model Context Protocol (MCP) server running on Cloudflare Workers that executes arbitrary Go code in a sandboxed environment.

## Features

- **MCP Tool**: `execute_go` - Execute any Go code in a secure sandbox
- **Go Sandbox**: Powered by Cloudflare Sandbox SDK
- **Multiple Endpoints**: Supports both SSE and standard MCP transports
- **Type-safe**: Built with TypeScript and Zod schemas

## How It Works

This MCP server provides a single tool called `execute_go` that:

1. Accepts complete Go source code as input
2. Writes the code to `/workspace/main.go` in a sandboxed container
3. Executes `go run /workspace/main.go`
4. Returns the output, errors, exit code, and success status

### Tool Requirements

The Go code must be:
- A complete, single-file program
- Include `package main` declaration
- Include a `func main() {}` function
- Output results using standard output (e.g., `fmt.Println()`)

**Example:**
```go
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
```

## API Endpoints

### MCP SSE Endpoint
```
/sse
```
Server-Sent Events transport for MCP protocol (used by Claude Desktop, etc.)

### MCP Standard Endpoint
```
/mcp
```
Standard MCP protocol endpoint

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run locally:
```bash
npm run dev
```

The first run will build the Docker container (2-3 minutes). Subsequent runs are much faster.

## Deploy

```bash
npm run deploy
```

After first deployment, wait 2-3 minutes for container provisioning before making requests.

## Usage with Claude Desktop

Add this configuration to your Claude Desktop MCP settings:

```json
{
  "mcpServers": {
    "go-sandbox": {
      "url": "https://your-worker.workers.dev/sse"
    }
  }
}
```

Replace `your-worker.workers.dev` with your actual Workers URL.

## Tool Schema

### Input
```typescript
{
  code: string  // Complete Go source code
}
```

### Output
```typescript
{
  output: string    // stdout from the Go program
  error: string     // stderr from the Go program
  exitCode: number  // Process exit code
  success: boolean  // Whether execution succeeded
}
```

## Development

Run type checking:
```bash
npm run typecheck
```

## Technical Details

- Built with `@modelcontextprotocol/sdk` for MCP protocol
- Uses `agents` package for Cloudflare Workers integration
- Powered by `@cloudflare/sandbox` for secure code execution
- Implements Durable Objects for session management

## License

MIT
