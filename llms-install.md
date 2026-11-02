# Installing the RepeatPost MCP server

These instructions are for AI agents, such as Cline, that set up MCP servers for a user.

RepeatPost is a **hosted remote MCP server**. There is nothing to clone, build, install or run, and there is **no API key**. Don't clone this repository: it holds documentation and metadata only.

| Setting | Value |
|---|---|
| Server name | `repeatpost` |
| URL | `https://api.repeatpost.com/mcp` |
| Transport | Streamable HTTP |
| Authentication | OAuth 2.1 sign-in in the user's browser |

## Before you start

The user needs a [RepeatPost account](https://www.repeatpost.com), with their social channels connected in the RepeatPost app. The server can only use channels that are already connected.

## Steps for Cline

1. Add the server to `cline_mcp_settings.json`, keeping any servers that are already there:

   ```json
   {
     "mcpServers": {
       "repeatpost": {
         "type": "streamableHttp",
         "url": "https://api.repeatpost.com/mcp",
         "disabled": false,
         "autoApprove": []
       }
     }
   }
   ```

   `"type": "streamableHttp"` is required. Without it, Cline uses the legacy SSE transport and can't connect.

2. Ask the user to select **Authenticate** next to `repeatpost` under **MCP Servers**, sign in to RepeatPost in the browser, and approve the permissions they want on the consent screen.

   Never ask the user for a password, API key or token, and don't add an `Authorization` header. The sign-in gives Cline its own OAuth tokens.

3. Check the connection by calling the read-only `listWorkspaces` tool. It returns the user's workspaces.

   Don't call tools that publish or delete, such as `publishPostGroup` or `deletePost`, to test the setup.

## If something goes wrong

| What happens | What to do |
|---|---|
| `401` or "Authorization required" | Sign-in hasn't finished. Ask the user to select **Authenticate** again and complete it in the browser. |
| Cline can't connect at all | Check that `"type"` is `"streamableHttp"` and the URL is exactly `https://api.repeatpost.com/mcp`. |
| A tool is refused for permissions | The user didn't approve that permission, or their workspace role doesn't allow it. They can remove and add the server again, and approve it on the consent screen. |
| A channel is missing | The user connects it in the RepeatPost app, not through the server. |

## If the client can't sign in to remote servers

Use [`mcp-remote`](https://www.npmjs.com/package/mcp-remote) as a local bridge. It opens the same browser sign-in:

```json
{
  "mcpServers": {
    "repeatpost": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://api.repeatpost.com/mcp"]
    }
  }
}
```

The full documentation is in [README.md](README.md) and at [help.repeatpost.com/integrations/mcp-server](https://help.repeatpost.com/integrations/mcp-server).
