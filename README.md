<p align="center">
  <img src="logo.png" width="96" height="96" alt="RepeatPost logo">
</p>

<h1 align="center">RepeatPost MCP Server</h1>

<p align="center">
  Schedule and publish social media posts, write captions and create branded graphics with RepeatPost, from Claude or any MCP client.
</p>

<p align="center">
  <a href="https://help.repeatpost.com/integrations/mcp-server">Documentation</a> ·
  <a href="https://www.repeatpost.com">Website</a> ·
  <a href="https://registry.modelcontextprotocol.io/v0/servers?search=com.repeatpost/mcp">MCP Registry</a> ·
  <a href="mailto:support@repeatpost.com">Support</a>
</p>

<p align="center">
  <a href="https://mcp.tc/i/repeatpost"><img src="https://mcp.tc/i/repeatpost/badge.svg" alt="RepeatPost on mcp.tc"></a>
</p>

---

RepeatPost MCP is a remote, hosted [Model Context Protocol](https://modelcontextprotocol.io) server. Add one URL to your AI assistant, sign in to RepeatPost in your browser, and choose what the assistant may do. It then works with the channels connected to your RepeatPost workspace and stays within your workspace role.

There is nothing to install or run. This repository holds the server's public metadata and documentation. The server itself runs at `https://api.repeatpost.com/mcp`.

## Connection details

| Setting | Value |
|---|---|
| **Server URL** | `https://api.repeatpost.com/mcp` |
| **Transport** | Streamable HTTP |
| **Authentication** | OAuth 2.1 with dynamic client registration and PKCE. No API keys, client IDs or headers to copy. |
| **Permissions** | Five OAuth scopes, each one chosen by the user on the consent screen |
| **Tools** | 35 (see [Tools](#tools)) |
| **Platforms** | 15 (see [Supported platforms](#supported-platforms)) |
| **MCP Registry name** | `com.repeatpost/mcp` |
| **Support** | [support@repeatpost.com](mailto:support@repeatpost.com) |

## Before you connect

- You need a [RepeatPost account](https://www.repeatpost.com).
- Connect your social channels in the RepeatPost app first. An assistant can only use channels that are already connected.

## Quick start

### Claude (web and desktop)

1. In Claude, open **Settings**, then **Connectors**, and select **Add custom connector**.
2. Paste `https://api.repeatpost.com/mcp` and select **Connect**.
3. Sign in to RepeatPost on the page that opens.
4. On the consent screen, untick anything you don't want to allow, then approve.

### Claude Code

```bash
claude mcp add --transport http repeatpost https://api.repeatpost.com/mcp
```

Then run `/mcp` in Claude Code, select **repeatpost** and authenticate in your browser.

### Cursor

Add this to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "repeatpost": {
      "url": "https://api.repeatpost.com/mcp"
    }
  }
}
```

### VS Code

Add this to `.vscode/mcp.json`:

```json
{
  "servers": {
    "repeatpost": {
      "type": "http",
      "url": "https://api.repeatpost.com/mcp"
    }
  }
}
```

### Clients that only support stdio

Use [`mcp-remote`](https://www.npmjs.com/package/mcp-remote) as a bridge:

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

### Any other MCP client

Any client that supports remote MCP servers with OAuth sign-in can connect. Add a remote server with the URL `https://api.repeatpost.com/mcp` and sign in when asked.

## Authentication

The server uses the standard MCP authorization flow. Credentials never pass through the AI client or the model: the user signs in on RepeatPost's own page in their browser, and the client receives OAuth tokens.

1. An unauthenticated request to `/mcp` returns `401` with a `WWW-Authenticate` header that points to the protected resource metadata.
2. The client reads the metadata, registers itself (RFC 7591 dynamic client registration) and opens the authorization page in the browser.
3. The user signs in, reviews the consent screen and approves.
4. The client exchanges the authorization code for tokens (PKCE S256) and calls `/mcp` with `Authorization: Bearer <access_token>`.

| Endpoint | URL |
|---|---|
| Protected resource metadata | `https://api.repeatpost.com/.well-known/oauth-protected-resource` |
| Authorization server metadata | `https://api.repeatpost.com/.well-known/oauth-authorization-server` |
| Client registration | `https://api.repeatpost.com/auth/oauth/register` |
| Authorization | `https://api.repeatpost.com/auth/oauth/authorize` |
| Token | `https://api.repeatpost.com/auth/oauth/token` |
| Revocation | `https://api.repeatpost.com/auth/oauth/revoke` |

| Detail | Value |
|---|---|
| PKCE | Required, `S256` only |
| Client authentication | `none` (public clients) or `client_secret_post` |
| Access token lifetime | 15 minutes |
| Refresh token lifetime | 30 days, rotated on every refresh |
| Two-factor authentication | Supported on the sign-in page |

### Permissions (OAuth scopes)

The consent screen lists five permissions, each with its own checkbox. A token carries only the scopes the user approved.

| Scope | Shown on the consent screen as | Allows |
|---|---|---|
| `mcp:read` | View your workspaces, channels, posts, media and credits | Looking things up. Changes nothing on its own. |
| `mcp:write` | Create and edit drafts, media, folders and brand voice settings | Preparing work: drafts, uploads, folders, graphics and brand voice changes |
| `mcp:publish` | Schedule and publish posts to your channels | Putting posts on the schedule or publishing them now |
| `mcp:delete` | Delete posts and media | Removing posts and media |
| `mcp:ai` | Generate captions (uses your AI credits) | Writing captions. Each caption costs 1 AI credit. |

Two rules apply whatever the user approves:

- **The workspace role is the ceiling.** An assistant can never do more than the user's role allows. A Viewer can only read.
- **Approvals still apply.** If posts on a channel need approval, posts scheduled there by an assistant go to approval first.

## Tools

The server exposes 35 tools in seven groups. [`tools.json`](tools.json) holds the full `tools/list` output: names, titles, descriptions, input schemas and MCP tool annotations (`readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`).

### Channels

| Tool | What it does | Scope |
|---|---|---|
| `integrationList` | List connected channels with platform, name, status, character limit and remaining posting capacity | `mcp:read` |
| `integrationSchema` | Get a platform's posting rules: character limits, supported media and per-post settings | `mcp:read` |
| `listPinterestBoards` | List the boards of a connected Pinterest account | `mcp:read` |
| `createPinterestBoard` | Create a board on a connected Pinterest account | `mcp:write` |
| `listWordPressPostTypes` | List the post types of a connected WordPress site | `mcp:read` |
| `listWordPressCategories` | List the categories of a connected WordPress site | `mcp:read` |
| `listWordPressTags` | List the tags of a connected WordPress site | `mcp:read` |
| `listSlackChannels` | List the channels of a connected Slack workspace | `mcp:read` |
| `listDiscordChannels` | List the channels of a connected Discord server | `mcp:read` |

### Posts

| Tool | What it does | Scope |
|---|---|---|
| `schedulePost` | Create a draft or schedule a post, on one channel or on several at once as a post group | `mcp:write` for drafts, `mcp:publish` to schedule |
| `listPosts` | List posts by status, channel and date range | `mcp:read` |
| `getPost` | Get one post with its full content, channel, schedule time and status | `mcp:read` |
| `updatePost` | Edit, reschedule or publish a draft or scheduled post | `mcp:write`, or `mcp:publish` to schedule or publish |
| `deletePost` | Delete a post from RepeatPost, and optionally from the platform | `mcp:delete` |
| `getPostGroup` | Get a post group: one post sent to several channels, with each channel's status | `mcp:read` |
| `deletePostGroup` | Delete the unpublished posts of a post group | `mcp:delete` |
| `publishPostGroup` | Publish a post group now on every channel | `mcp:publish` |
| `retryPostGroup` | Put the failed posts of a post group back in the queue | `mcp:publish` |

### Media library

| Tool | What it does | Scope |
|---|---|---|
| `mediaList` | Search files across the whole media library by name, type and favourite status | `mcp:read` |
| `mediaBrowse` | Browse the media library one folder at a time | `mcp:read` |
| `mediaUpload` | Upload a file from a public URL or from base64 data | `mcp:write` |
| `folderCreate` | Create a media folder | `mcp:write` |
| `mediaRename` | Rename a file or folder, or change a file's caption | `mcp:write` |
| `mediaMove` | Move files and folders into another folder | `mcp:write` |
| `mediaDelete` | Delete files and folders | `mcp:delete` |
| `mediaFavorite` | Toggle the favourite flag on files and folders | `mcp:write` |

### Branded graphics

| Tool | What it does | Scope |
|---|---|---|
| `renderGraphic` | Render an SVG design to a PNG and save it to the media library | `mcp:write` |
| `brandImage` | Add the brand logo, and optionally a frame or caption band, to an image and save it as a new file | `mcp:write` |

### Brand voice

| Tool | What it does | Scope |
|---|---|---|
| `listBrandVoices` | List the workspace's brand voices | `mcp:read` |
| `getBrandVoice` | Show which brand voice applies and why, with its colours, logo and visual style | `mcp:read` |
| `setDefaultBrandVoice` | Make a brand voice the workspace default | `mcp:write` |

### AI captions

| Tool | What it does | Scope |
|---|---|---|
| `generateCaption` | Write a ready-to-publish caption in the brand voice that applies. Uses 1 AI credit. | `mcp:ai` |

### Workspaces and credits

| Tool | What it does | Scope |
|---|---|---|
| `listWorkspaces` | List the workspaces the user can access | `mcp:read` |
| `switchWorkspace` | Switch the active workspace for the rest of the session | `mcp:read` |
| `creditsBalance` | Get the AI credit balance and the cost of each AI action | `mcp:read` |

These tools are marked `destructiveHint: true`, so clients can ask the user before running them: `updatePost`, `deletePost`, `deletePostGroup`, `publishPostGroup`, `mediaRename`, `mediaDelete` and `setDefaultBrandVoice`.

## Supported platforms

An assistant can publish to any channel connected in RepeatPost, on 15 platforms:

- **Social networks:** Facebook (pages, groups and profiles), Instagram, LinkedIn (profiles and pages), X (Twitter), Threads, Bluesky and Mastodon
- **Video and visual:** YouTube, Pinterest and Dribbble
- **Business, chat and blogs:** Google Business Profile, Telegram, Slack, Discord and WordPress

## Branded graphics

No AI image model is involved. The assistant designs the layout as SVG, and RepeatPost renders it to a PNG in the media library.

| Size | Pixels |
|---|---|
| Square | 1080x1080 |
| Portrait | 1080x1350 |
| Story | 1080x1920 |
| Landscape | 1200x628 |
| Wide | 1920x1080 |

Text can be set in Inter, Montserrat, Poppins, Playfair Display or Roboto, and the design can use the colours and logo from the workspace's brand voice. `brandImage` puts the brand logo on a photo from the media library and saves a new copy, so the original never changes.

## AI credits

Only captions cost AI credits. Everything else is free.

| Action | AI credits |
|---|---|
| Writing a caption (`generateCaption`) | 1 |
| Branded graphics and logos on photos | Free |
| Scheduling, publishing and editing posts | Free |
| Media library actions | Free |

## Example prompts

- *"Schedule a post about our weekend sale to Instagram and LinkedIn for Friday at 9am."*
- *"Make a square post announcing our 20% weekend sale in our brand style and save it as a draft."*
- *"Add our logo to the summer product photo in my media library."*
- *"What's scheduled for next week, and did any posts fail?"*
- *"Write three LinkedIn captions about our new feature in our brand voice."*

## What it doesn't do

- **AI images and videos.** Create them in the RepeatPost app, then ask your assistant to schedule them from the media library.
- **Connecting channels.** Connect social channels in the RepeatPost app.
- **Accounts and billing.** Create an account and change plans in the RepeatPost app.

## Security and privacy

- Sign-in happens on RepeatPost's own page. The assistant never sees the user's password.
- Each token carries only the permissions the user approved, and never more than the user's workspace role.
- By default, deleting a post removes it from RepeatPost only. Deleting it on the platform as well needs an explicit request from a workspace Owner.
- To disconnect, remove the RepeatPost connector in your assistant's settings, or email [support@repeatpost.com](mailto:support@repeatpost.com) to have its access revoked.

Read [AI assistants and connectors](https://www.repeatpost.com/privacy#ai-assistants-and-connectors) in the RepeatPost Privacy Policy, and the [Terms of Service](https://www.repeatpost.com/terms).

To report a security issue, email [support@repeatpost.com](mailto:support@repeatpost.com).

## Repository contents

| File | Purpose |
|---|---|
| [`README.md`](README.md) | This guide |
| [`server.json`](server.json) | Server metadata in the [MCP Registry](https://registry.modelcontextprotocol.io) format |
| [`tools.json`](tools.json) | The server's `tools/list` output: names, descriptions, input schemas and annotations |
| [`logo.png`](logo.png) | RepeatPost logo, 512x512 |
| [`LICENSE`](LICENSE) | MIT license for the contents of this repository |

## Links

- Documentation: [help.repeatpost.com/integrations/mcp-server](https://help.repeatpost.com/integrations/mcp-server)
- Website: [www.repeatpost.com](https://www.repeatpost.com)
- MCP Registry entry: [`com.repeatpost/mcp`](https://registry.modelcontextprotocol.io/v0/servers?search=com.repeatpost/mcp)
- Support: [support@repeatpost.com](mailto:support@repeatpost.com)

## License

The contents of this repository are released under the [MIT License](LICENSE). The hosted RepeatPost service is governed by the [RepeatPost Terms of Service](https://www.repeatpost.com/terms). The RepeatPost name and logo are trademarks of RepeatPost and are not licensed for use outside of referring to RepeatPost.
