import { getSandbox } from '@cloudflare/sandbox';
import OAuthProvider from '@cloudflare/workers-oauth-provider';
import { McpAgent } from 'agents/mcp';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { handleAccessRequest } from './access-handler';
import type { Props } from './workers-oauth-utils';

export { Sandbox } from '@cloudflare/sandbox';

class PerlSandboxMCP extends McpAgent<Env, Record<string, never>, Props> {
  server = new McpServer({
    name: 'perl-sandbox-mcp',
    version: '1.0.0',
  });

  async init() {
    const self = this;
    this.server.registerTool(
      'execute_perl',
      {
        title: 'Execute Perl Code',
        description:
          'Execute arbitrary Perl code in a sandboxed environment. ' +
          'The code should be a complete Perl script. ' +
          'Output results to standard output (stdout) using print. ' +
          'Example: use strict;\\nuse warnings;\\nprint "Hello\\n";',
        inputSchema: {
          code: z
            .string()
            .describe('Complete Perl script'),
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
          const sandbox = getSandbox(self.env.Sandbox, 'perl-mcp-sandbox');

          // Write Perl code to file
          await sandbox.writeFile('/workspace/script.pl', code);

          // Execute the Perl code
          const result = await sandbox.exec('perl /workspace/script.pl');

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

export { PerlSandboxMCP };

async function handleMcpRequest(req: Request, env: Env, ctx: ExecutionContext) {
  const { pathname } = new URL(req.url);
  if (pathname === '/sse' || pathname === '/sse/message') {
    return PerlSandboxMCP.serveSSE('/sse', { binding: 'PerlSandboxMCP' }).fetch(req, env, ctx);
  }
  if (pathname === '/mcp') {
    return PerlSandboxMCP.serve('/mcp', { binding: 'PerlSandboxMCP' }).fetch(req, env, ctx);
  }
  return new Response('Not found', { status: 404 });
}

export default new OAuthProvider({
  apiHandler: { fetch: handleMcpRequest as any },
  apiRoute: ['/sse', '/mcp'],
  authorizeEndpoint: '/authorize',
  clientRegistrationEndpoint: '/register',
  defaultHandler: { fetch: handleAccessRequest as any },
  tokenEndpoint: '/token',
});
