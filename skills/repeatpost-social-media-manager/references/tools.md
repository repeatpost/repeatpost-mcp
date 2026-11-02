# Tools reference

All 35 RepeatPost tools. The server already gives you each tool's full description and parameters. This table adds two things: the permission (OAuth scope) each tool needs, and whether to ask the user before calling it. "Ask first" follows the [Confirm before acting](../SKILL.md#9-confirm-before-acting) rules.

| Tool | What it does | Scope | Ask first |
|---|---|---|---|
| `integrationList` | List connected channels with platform, name, status, character limit and remaining posting capacity | `mcp:read` | No |
| `integrationSchema` | Get a platform's posting rules: character limits, supported media and per-post settings | `mcp:read` | No |
| `listPinterestBoards` | List the boards of a connected Pinterest account | `mcp:read` | No |
| `createPinterestBoard` | Create a board on a connected Pinterest account | `mcp:write` | Yes |
| `listWordPressPostTypes` | List the post types of a connected WordPress site | `mcp:read` | No |
| `listWordPressCategories` | List the categories of a connected WordPress site | `mcp:read` | No |
| `listWordPressTags` | List the tags of a connected WordPress site | `mcp:read` | No |
| `listSlackChannels` | List the channels of a connected Slack workspace | `mcp:read` | No |
| `listDiscordChannels` | List the channels of a connected Discord server | `mcp:read` | No |
| `schedulePost` | Create a draft or schedule a post, on one channel or on several at once as a post group | `mcp:write` for drafts, `mcp:publish` to schedule | Yes, to schedule. Drafts don't need it |
| `listPosts` | List posts by status, channel and date range | `mcp:read` | No |
| `getPost` | Get one post with its full content, channel, schedule time and status | `mcp:read` | No |
| `updatePost` | Edit, reschedule or publish a draft or scheduled post | `mcp:write`, or `mcp:publish` to schedule or publish | Yes |
| `deletePost` | Delete a post from RepeatPost, and optionally from the platform | `mcp:delete` | Yes |
| `getPostGroup` | Get a post group: one post sent to several channels, with each channel's status | `mcp:read` | No |
| `deletePostGroup` | Delete the unpublished posts of a post group | `mcp:delete` | Yes |
| `publishPostGroup` | Publish a post group now on every channel | `mcp:publish` | Yes |
| `retryPostGroup` | Put the failed posts of a post group back in the queue | `mcp:publish` | Yes |
| `mediaList` | Search files across the whole media library by name, type and favourite status | `mcp:read` | No |
| `mediaBrowse` | Browse the media library one folder at a time | `mcp:read` | No |
| `mediaUpload` | Upload a file from a public URL or from base64 data | `mcp:write` | No |
| `folderCreate` | Create a media folder | `mcp:write` | No |
| `mediaRename` | Rename a file or folder, or change a file's caption | `mcp:write` | Yes |
| `mediaMove` | Move files and folders into another folder | `mcp:write` | No |
| `mediaDelete` | Delete files and folders | `mcp:delete` | Yes |
| `mediaFavorite` | Toggle the favourite flag on files and folders | `mcp:write` | No |
| `renderGraphic` | Render an SVG design to a PNG and save it to the media library | `mcp:write` | No |
| `brandImage` | Add the brand logo, and optionally a frame or caption band, to an image and save it as a new file | `mcp:write` | No |
| `listBrandVoices` | List the workspace's brand voices | `mcp:read` | No |
| `getBrandVoice` | Show which brand voice applies and why, with its colours, logo and visual style | `mcp:read` | No |
| `setDefaultBrandVoice` | Make a brand voice the workspace default | `mcp:write` | Yes |
| `generateCaption` | Write a ready-to-publish caption in the brand voice that applies. Uses 1 AI credit | `mcp:ai` | Mention the credit cost before generating several |
| `listWorkspaces` | List the workspaces the user can access | `mcp:read` | No |
| `switchWorkspace` | Switch the active workspace for the rest of the session | `mcp:read` | Yes |
| `creditsBalance` | Get the AI credit balance and the cost of each AI action | `mcp:read` | No |

The workspace role is always the ceiling: a Viewer can only read, whatever scopes were approved.
