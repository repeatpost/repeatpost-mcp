# Contributing

This repository holds the documentation and public metadata of the hosted RepeatPost MCP server. The server's code is not here, so changes to how the server behaves can't be made with a pull request to this repository. Bug reports, tool requests and documentation fixes are welcome.

## Report a bug

Open a [bug report](https://github.com/repeatpost/repeatpost-mcp/issues/new?template=bug_report.yml). Include your AI client, the tool involved, when it happened and the exact error message.

Never paste access tokens, refresh tokens, passwords or API keys: issues are public. Report security problems privately, as described in [SECURITY.md](SECURITY.md).

## Request a tool

Open a [tool request](https://github.com/repeatpost/repeatpost-mcp/issues/new?template=tool_request.yml). Describe what you want your assistant to do, and give an example prompt you would type.

## Improve the documentation

Pull requests that fix or clarify the documentation are welcome. Follow these rules:

- **Describe only what the server does today.** Don't document planned features.
- **Don't edit `tools.json` by hand.** It is the server's `tools/list` output, and it changes when the server changes.
- **Leave `server.json` to the RepeatPost team.** It is the server's [MCP Registry](https://registry.modelcontextprotocol.io) listing, and a published version can't be edited or reused.

### README conventions

[`scripts/validate-metadata.mjs`](scripts/validate-metadata.mjs) checks the README against `tools.json` on every pull request. It relies on these conventions:

- Every tool appears exactly once in a table under the `## MCP tools` heading, with its name in backticks in the first column.
- The line containing `` `destructiveHint: true` `` in that section lists exactly the tools that `tools.json` marks as destructive.
- Every platform is one row in the table under the `## Supported social media platforms` heading.
- Counts are written as "35 tools" and "15 platforms", or in the `**Tools**` and `**Platforms**` rows of the connection details table. Every count written this way is checked.
- Links to headings (`#anchor`) and to files in this repository must resolve.

The expected tool and platform counts are in [`scripts/expected.json`](scripts/expected.json). When a tool or platform is added or removed, update the count there in the same pull request.

### Check your change

You need Node.js 20 or later.

```bash
npm ci
npm run validate
```

`npm run check-live` also checks the live endpoint's sign-in setup against `server.json` and the README. It sends no credentials and never calls a tool.

## Pull requests

- Keep each pull request to one topic, and explain what changed and why.
- Make sure the **Validate metadata** check passes.
- Never commit secrets, tokens or private configuration.
