<p align="center">
  <img src="logo.png" width="96" height="96" alt="RepeatPost logo">
</p>

<h1 align="center">RepeatPost MCP Server</h1>

<p align="center">
  Schedule and publish social media posts, write captions and create branded graphics with RepeatPost, from Claude or any MCP client.
</p>

<p align="center">
  <a href="https://registry.modelcontextprotocol.io/v0/servers?search=com.repeatpost/mcp"><img src="https://img.shields.io/badge/MCP_Registry-com.repeatpost%2Fmcp-2563eb" alt="MCP Registry: com.repeatpost/mcp"></a>
  <a href="https://mcp.tc/i/repeatpost"><img src="https://mcp.tc/i/repeatpost/badge.svg" alt="RepeatPost on mcp.tc"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/repeatpost/repeatpost-mcp" alt="MIT License"></a>
</p>

<p align="center">
  <a href="https://help.repeatpost.com/integrations/mcp-server">Documentation</a> ·
  <a href="https://www.repeatpost.com/mcp">MCP server page</a> ·
  <a href="https://www.repeatpost.com">Website</a> ·
  <a href="#directory-listings">Directories</a> ·
  <a href="mailto:support@repeatpost.com">Support</a>
</p>

---

## Overview

RepeatPost MCP is a remote, hosted [Model Context Protocol](https://modelcontextprotocol.io) server. Add one URL to your AI assistant, sign in to RepeatPost in your browser, and choose what the assistant may do. It then works with the channels connected to your RepeatPost workspace and stays within your workspace role.

There is nothing to install or run. This repository holds the server's public metadata and documentation, not its source code. The server itself runs at `https://api.repeatpost.com/mcp`.

### Connection details

| Setting | Value |
|---|---|
| **Server URL** | `https://api.repeatpost.com/mcp` |
| **Transport** | Streamable HTTP |
| **Authentication** | OAuth 2.1 with dynamic client registration and PKCE. No API keys, client IDs or headers to copy. |
| **Permissions** | Five OAuth scopes, each one chosen by the user on the consent screen |
| **Tools** | 35 (see [MCP tools](#mcp-tools)) |
| **Platforms** | 15 (see [Supported social media platforms](#supported-social-media-platforms)) |
| **MCP Registry name** | `com.repeatpost/mcp` |
| **Support** | [support@repeatpost.com](mailto:support@repeatpost.com) |

## Key features

- **Publish to 15 platforms.** Create drafts, schedule, publish, edit and reschedule posts on any connected channel. Send one post to several channels at once as a post group, with a status for each channel and a retry for the failed ones.
- **Captions in your brand voice.** The assistant writes ready-to-publish captions in the brand voice that applies. Each caption costs 1 AI credit.
- **Branded graphics without an image model.** The assistant designs a layout as SVG and RepeatPost renders it to a PNG, using your brand colours and logo. It can also add your logo to a photo.
- **Media library.** Search, browse, upload, organise, rename, favourite and delete files and folders.
- **Workspaces and brand voices.** List and switch workspaces, see which brand voice applies, and set the default one.
- **You choose the permissions.** Five OAuth scopes, each with its own checkbox on the consent screen. The workspace role is always the ceiling, and channel approvals still apply.
- **Standard MCP sign-in.** OAuth 2.1 with dynamic client registration and PKCE. Credentials never pass through the AI client or the model.
- **Annotated tools.** Every tool carries MCP tool annotations, so clients can ask before running destructive ones.

<!--
  DEMO VIDEO PLACEHOLDER
  Add a short screen recording here once a real one exists, for example:
  connect the server, sign in, then schedule a post with one prompt.
  Use real recordings only: no mock-ups or generated screenshots.
-->

### What it doesn't do

- **AI images and videos.** Create them in the RepeatPost app, then ask your assistant to schedule them from the media library.
- **Connecting channels.** Connect social channels in the RepeatPost app.
- **Accounts and billing.** Create an account and change plans in the RepeatPost app.

## Supported social media platforms

An assistant can publish to any channel connected in RepeatPost, on 15 platforms:

| Platform | Group | Notes |
|---|---|---|
| Facebook | Social networks | Pages, groups and profiles |
| Instagram | Social networks | |
| LinkedIn | Social networks | Profiles and pages |
| X (Twitter) | Social networks | |
| Threads | Social networks | |
| Bluesky | Social networks | |
| Mastodon | Social networks | |
| YouTube | Video and visual | |
| Pinterest | Video and visual | Boards: `listPinterestBoards`, `createPinterestBoard` |
| Dribbble | Video and visual | |
| Google Business Profile | Business, chat and blogs | |
| Telegram | Business, chat and blogs | |
| Slack | Business, chat and blogs | Channels: `listSlackChannels` |
| Discord | Business, chat and blogs | Channels: `listDiscordChannels` |
| WordPress | Business, chat and blogs | Post types, categories and tags: `listWordPressPostTypes`, `listWordPressCategories`, `listWordPressTags` |

## MCP tools

The server exposes 35 tools in seven groups. [`tools.json`](tools.json) holds the full `tools/list` output: names, titles, descriptions, input schemas and MCP tool annotations (`readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`). The Scope column refers to the [OAuth scopes](#permissions-oauth-scopes).

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

### Graphic sizes and fonts

No AI image model is involved. The assistant designs the layout as SVG, and RepeatPost renders it to a PNG in the media library.

| Size | Pixels |
|---|---|
| Square | 1080x1080 |
| Portrait | 1080x1350 |
| Story | 1080x1920 |
| Landscape | 1200x628 |
| Wide | 1920x1080 |

Text can be set in Inter, Montserrat, Poppins, Playfair Display or Roboto, and the design can use the colours and logo from the workspace's brand voice. `brandImage` puts the brand logo on a photo from the media library and saves a new copy, so the original never changes.

### AI credits

Only captions cost AI credits. Everything else is free.

| Action | AI credits |
|---|---|
| Writing a caption (`generateCaption`) | 1 |
| Branded graphics and logos on photos | Free |
| Scheduling, publishing and editing posts | Free |
| Media library actions | Free |

## Installation and setup

There is nothing to install. You add the server URL to your AI client and sign in.

### Before you connect

- You need a [RepeatPost account](https://www.repeatpost.com).
- Connect your social channels in the RepeatPost app first. An assistant can only use channels that are already connected.

### Connect in four steps

1. Add `https://api.repeatpost.com/mcp` as a remote MCP server in your client. See [Client configuration](#client-configuration).
2. Sign in to RepeatPost on the page your client opens in the browser.
3. On the consent screen, untick anything you don't want to allow, then approve. See [Permissions (OAuth scopes)](#permissions-oauth-scopes).
4. Ask your assistant to do something, for example one of the [example workflows](#example-workflows).

## Authentication and OAuth

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

The scopes a token can carry are listed under [Permissions (OAuth scopes)](#permissions-oauth-scopes).

## Client configuration

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

## Example workflows

- *"Schedule a post about our weekend sale to Instagram and LinkedIn for Friday at 9am."*
- *"Make a square post announcing our 20% weekend sale in our brand style and save it as a draft."*
- *"Add our logo to the summer product photo in my media library."*
- *"What's scheduled for next week, and did any posts fail?"*
- *"Write three LinkedIn captions about our new feature in our brand voice."*

## Tool permissions and security

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

### Security and privacy

- Sign-in happens on RepeatPost's own page. The assistant never sees the user's password.
- Each token carries only the permissions the user approved, and never more than the user's workspace role.
- By default, deleting a post removes it from RepeatPost only. Deleting it on the platform as well needs an explicit request from a workspace Owner.
- To disconnect, remove the RepeatPost connector in your assistant's settings, or email [support@repeatpost.com](mailto:support@repeatpost.com) to have its access revoked.

Read [AI assistants and connectors](https://www.repeatpost.com/privacy#ai-assistants-and-connectors) in the RepeatPost Privacy Policy, and the [Terms of Service](https://www.repeatpost.com/terms).

To report a security issue, follow [SECURITY.md](SECURITY.md) or email [support@repeatpost.com](mailto:support@repeatpost.com).

## Troubleshooting

| Problem | What to do |
|---|---|
| The client asks you to sign in, or reports `401` | This is how sign-in starts. Finish signing in on the RepeatPost page in your browser. In Claude Code, run `/mcp`, select **repeatpost** and authenticate. |
| You are asked to sign in again after a long break | Refresh tokens last 30 days and are rotated on every refresh. After 30 days without use, sign in again. |
| A channel is missing | Connect it in the RepeatPost app. An assistant can only use channels that are already connected. |
| An action is refused for permissions | The scope wasn't approved on the consent screen, or your workspace role doesn't allow it (a Viewer can only read). Reconnect and approve the scope, or ask a workspace Owner. |
| A scheduled post went to approval | The channel needs approval, and posts scheduled there by an assistant go to approval first. |
| Captions aren't being written | Each caption costs 1 AI credit. Ask your assistant for your credit balance. |
| A post was deleted in RepeatPost but is still on the platform | This is the default. Deleting it on the platform as well needs an explicit request from a workspace Owner. |
| Your client only supports stdio servers | Use [`mcp-remote`](https://www.npmjs.com/package/mcp-remote) as a bridge. See [Clients that only support stdio](#clients-that-only-support-stdio). |
| You want to disconnect | Remove the RepeatPost connector in your assistant's settings, or email [support@repeatpost.com](mailto:support@repeatpost.com) to have its access revoked. |

## Directory listings

RepeatPost is listed in these MCP directories:

| Directory | Listing |
|---|---|
| Official MCP Registry | [`com.repeatpost/mcp`](https://registry.modelcontextprotocol.io/v0/servers?search=com.repeatpost/mcp) |
| Glama | [glama.ai/mcp/connectors/com.repeatpost/mcp](https://glama.ai/mcp/connectors/com.repeatpost/mcp) |
| Smithery | [smithery.ai/servers/info-342p/repeatpost](https://smithery.ai/servers/info-342p/repeatpost) |
| mcp.tc | [mcp.tc/i/repeatpost](https://mcp.tc/i/repeatpost) |
| MCPBundles | [mcpbundles.com/skills/repeatpost-mcp](https://www.mcpbundles.com/skills/repeatpost-mcp) |

## Support

- Documentation: [help.repeatpost.com/integrations/mcp-server](https://help.repeatpost.com/integrations/mcp-server)
- MCP server page: [www.repeatpost.com/mcp](https://www.repeatpost.com/mcp)
- Website: [www.repeatpost.com](https://www.repeatpost.com)
- Email: [support@repeatpost.com](mailto:support@repeatpost.com)
- Bugs and tool requests: [GitHub issues](https://github.com/repeatpost/repeatpost-mcp/issues)
- Security: [SECURITY.md](SECURITY.md)

See [SUPPORT.md](SUPPORT.md) for what to include when you ask for help.

## Repository contents

| File | Purpose |
|---|---|
| [`README.md`](README.md) | This guide |
| [`server.json`](server.json) | Server metadata in the [MCP Registry](https://registry.modelcontextprotocol.io) format |
| [`tools.json`](tools.json) | The server's `tools/list` output: names, descriptions, input schemas and annotations |
| [`logo.png`](logo.png) | RepeatPost logo, 512x512 |
| [`LICENSE`](LICENSE) | MIT license for the contents of this repository |
| [`SECURITY.md`](SECURITY.md) | How to report a vulnerability |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | How to report bugs, request tools and change the docs |
| [`SUPPORT.md`](SUPPORT.md) | Where to get help |
| [`CHANGELOG.md`](CHANGELOG.md) | Changes to this repository |
| [`scripts/`](scripts) | Checks that keep `server.json`, `tools.json` and this README consistent |
| [`.github/`](.github) | Workflows, issue forms and the pull request template |

## License

The contents of this repository are released under the [MIT License](LICENSE). The hosted RepeatPost service is governed by the [RepeatPost Terms of Service](https://www.repeatpost.com/terms). The RepeatPost name and logo are trademarks of RepeatPost and are not licensed for use outside of referring to RepeatPost.
