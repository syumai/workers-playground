import { getSandbox } from '@cloudflare/sandbox';
import { McpAgent } from 'agents/mcp';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export { Sandbox } from '@cloudflare/sandbox';

class GoSandboxMCP extends McpAgent<Env> {
  server = new McpServer({
    name: 'go-sandbox-mcp',
    version: '1.0.0',
  });

  async init() {
    const self = this;
    this.server.registerTool(
      'execute_go',
      {
        title: 'Execute Go Code',
        description:
          'Execute arbitrary Go code in a sandboxed environment. ' +
          'The code must be a complete, single-file Go program that includes ' +
          "'package main' and a 'func main() {}' function. " +
          'Output results to standard output (stdout) using fmt.Print/Printf/Println. ' +
          'Example: package main\\nimport "fmt"\\nfunc main() { fmt.Println("Hello") }',
        inputSchema: {
          code: z
            .string()
            .describe('Complete Go source code including package main and main function'),
        },
        outputSchema: {
          output: z.string(),
          error: z.string(),
          exitCode: z.number(),
          success: z.boolean(),
        },
      },
      async ({ code }: { code: string }) => {
        try {
          // Get sandbox instance
          const sandbox = getSandbox(self.env.Sandbox, 'go-mcp-sandbox');

          // Write Go code to file
          await sandbox.writeFile('/workspace/main.go', code);

          // Execute the Go code
          const result = await sandbox.exec('go run /workspace/main.go');

          // Return the execution result
          const output = {
            output: result.stdout,
            error: result.stderr,
            exitCode: result.exitCode,
            success: result.success,
          };

          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(output, null, 2),
              },
            ],
            structuredContent: output,
          };
        } catch (error) {
          const errorOutput = {
            output: '',
            error: error instanceof Error ? error.message : String(error),
            exitCode: 1,
            success: false,
          };
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(errorOutput),
              },
            ],
            structuredContent: errorOutput,
            isError: true,
          };
        }
      }
    );
  }
}

export { GoSandboxMCP };

const sseHandler = GoSandboxMCP.serveSSE('/sse', { binding: 'GoSandboxMCP' });
const mcpHandler = GoSandboxMCP.serve('/mcp', { binding: 'GoSandboxMCP' });

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Route MCP SSE endpoint
    if (url.pathname === '/sse' || url.pathname === '/sse/message') {
      return sseHandler.fetch(request, env, ctx);
    }

    // Route MCP standard endpoint
    if (url.pathname === '/mcp') {
      return mcpHandler.fetch(request, env, ctx);
    }

    // 404 for other paths
    return new Response('Not Found. Available endpoints: /sse, /mcp', { status: 404 });
  },
};
