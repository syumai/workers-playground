import { getSandbox } from '@cloudflare/sandbox';

export { Sandbox } from '@cloudflare/sandbox';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Get or create a sandbox instance
    const sandbox = getSandbox(env.Sandbox, 'my-sandbox');

    // Execute Go code
    if (url.pathname === '/run') {
      await sandbox.writeFile('/workspace/main.go', `package main

import (
  "fmt"
  "time"
)

func main() {
	fmt.Printf("Hello, World! %s\\n", time.Now().Format(time.RFC3339))
}`);

      const result = await sandbox.exec('go run /workspace/main.go');
      return Response.json({
        output: result.stdout,
        error: result.stderr,
        exitCode: result.exitCode,
        success: result.success
      });
    }

    return new Response('Try /run');
  }
};
