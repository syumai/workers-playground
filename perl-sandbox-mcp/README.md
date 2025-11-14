# perl-sandbox-mcp

A Model Context Protocol (MCP) server running on Cloudflare Workers that executes arbitrary Perl code in a sandboxed environment.

## Features

- **MCP Tool**: `execute_perl` - Execute any Perl code in a secure sandbox
- **Perl Sandbox**: Powered by Cloudflare Sandbox SDK
- **OAuth Authentication**: Cloudflare Access integration for secure user authentication
- **Multiple Endpoints**: Supports both SSE and standard MCP transports
- **Type-safe**: Built with TypeScript and Zod schemas
- **CSRF Protection**: RFC 9700 compliant security measures

## How It Works

This MCP server provides a single tool called `execute_perl` that:

1. Accepts complete Perl script as input
2. Writes the code to `/workspace/script.pl` in a sandboxed container
3. Executes `perl /workspace/script.pl`
4. Returns the output, errors, exit code, and success status

### Tool Requirements

The Perl code should be:
- A complete Perl script
- Output results using standard output (e.g., `print`)

**Example:**
```perl
use strict;
use warnings;

print "Hello, World!\n";
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

### OAuth Endpoints
```
/authorize  - OAuth authorization endpoint
/callback   - OAuth callback endpoint
/token      - Token endpoint
/register   - Client registration endpoint
```

## Authentication Setup

This server uses Cloudflare Access for OAuth authentication. Follow these steps to configure authentication:

### 1. Create Cloudflare Access Application

1. Go to [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/)
2. Navigate to **Access** → **Applications**
3. Click **Add an application** → **SaaS**
4. Select **OIDC** as the protocol
5. Configure your application:
   - **Application name**: `perl-sandbox-mcp` (or your preferred name)
   - **Entity ID or Issuer**: Your entity ID
   - **Assertion Consumer Service URL**: Not required for OIDC
   - **Name ID format**: Email

### 2. Get OAuth Credentials

After creating the application, Cloudflare will display your OAuth credentials:

- **Client ID**
- **Client Secret**
- **Authorization endpoint**
- **Token endpoint**
- **JWKS endpoint** (Key endpoint)

Copy these values - you'll need them for environment configuration.

### 3. Configure Callback URL

In your Cloudflare Access application settings, add the callback URL:
```
https://your-worker.workers.dev/callback
```

For local development:
```
http://localhost:8787/callback
```

### 4. Create KV Namespace

Create a KV namespace for OAuth state management:

```bash
# Create KV namespace
npx wrangler kv:namespace create "OAUTH_KV"

# For local development, create a preview namespace
npx wrangler kv:namespace create "OAUTH_KV" --preview
```

Copy the namespace ID from the output and update `wrangler.jsonc`:

```jsonc
"kv_namespaces": [
  {
    "binding": "OAUTH_KV",
    "id": "your-namespace-id-here"
  }
]
```

### 5. Set Environment Variables

#### For Local Development

Create a `.dev.vars` file (copy from `.dev.vars.example`):

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` and fill in your Cloudflare Access credentials:

```
ACCESS_CLIENT_ID=your-client-id-from-dashboard
ACCESS_CLIENT_SECRET=your-client-secret-from-dashboard
ACCESS_TOKEN_URL=https://your-team.cloudflareaccess.com/cdn-cgi/access/token
ACCESS_AUTHORIZATION_URL=https://your-team.cloudflareaccess.com/cdn-cgi/access/authorize
ACCESS_JWKS_URL=https://your-team.cloudflareaccess.com/cdn-cgi/access/certs
COOKIE_ENCRYPTION_KEY=<generate-with-openssl-rand-hex-32>
```

Generate the cookie encryption key:
```bash
openssl rand -hex 32
```

#### For Production Deployment

Set secrets using Wrangler:

```bash
# Set each secret
npx wrangler secret put ACCESS_CLIENT_ID
npx wrangler secret put ACCESS_CLIENT_SECRET
npx wrangler secret put ACCESS_TOKEN_URL
npx wrangler secret put ACCESS_AUTHORIZATION_URL
npx wrangler secret put ACCESS_JWKS_URL
npx wrangler secret put COOKIE_ENCRYPTION_KEY
```

When prompted, paste the corresponding value for each secret.

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
    "perl-sandbox": {
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
  code: string  // Complete Perl script
}
```

### Output
```typescript
{
  output: string    // stdout from the Perl script
  error: string     // stderr from the Perl script
  exitCode: number  // Process exit code
  success: boolean  // Whether execution succeeded
}
```

## Development

Run type checking:
```bash
npm run typecheck
```

## Authentication Flow

1. MCP client initiates OAuth flow by calling `/authorize`
2. Server checks if client is already approved (via signed cookie)
3. If not approved, displays approval dialog with client information
4. User approves the request with CSRF protection
5. Server redirects to Cloudflare Access for authentication
6. Cloudflare Access authenticates the user and redirects to `/callback`
7. Server validates the OAuth state and exchanges code for tokens
8. JWT token is verified using JWKS public keys
9. Server completes OAuth flow and returns access token to MCP client

## Security Features

- **CSRF Protection**: RFC 9700 compliant one-time use tokens
- **OAuth State Validation**: Secure state management using KV storage with TTL
- **JWT Verification**: RSA signature verification using JWKS public keys
- **Signed Cookies**: HMAC-SHA256 signed cookies for approved client tracking
- **XSS Protection**: Input sanitization for all user-provided content
- **URL Validation**: RFC 3986 and RFC 7591 compliant URL validation

## Technical Details

- Built with `@modelcontextprotocol/sdk` for MCP protocol
- Uses `@cloudflare/workers-oauth-provider` for OAuth 2.1 implementation
- Uses `agents` package for Cloudflare Workers integration
- Powered by `@cloudflare/sandbox` for secure code execution
- Implements Durable Objects for session management
- KV storage for OAuth state management

## License

MIT
