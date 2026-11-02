# Changelog

All notable changes to this repository are recorded here, in the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format.

The hosted server has its own version: the `version` field in [`server.json`](server.json), currently 1.3.1. Its published versions are listed in the [MCP Registry](https://registry.modelcontextprotocol.io/v0/servers?search=com.repeatpost/mcp).

## [Unreleased]

### Added

- The `repeatpost-social-media-manager` agent skill in `skills/`, installed with `npx skills add repeatpost/repeatpost-mcp`. The validator checks its format and that every tool and parameter name it uses exists in `tools.json`.
- A Cursor plugin: `.cursor-plugin/plugin.json` and `mcp.json`, plus square logos on a white background in `assets/`.
- `llms-install.md` and a Cline section in the README, for agents that set up the server themselves.
- `SECURITY.md`, `CONTRIBUTING.md`, `SUPPORT.md` and this changelog.
- A **Validate metadata** workflow that checks `server.json` against the official MCP Registry schema, checks `tools.json`, and checks that the README agrees with both on every push and pull request to `main`.
- A manual **Check live endpoint** workflow that checks the live server's sign-in setup without credentials.
- Issue forms for bug reports and tool requests, and a pull request template.
- README: the mcp.tc badge, Directory listings, Key features and Troubleshooting sections.

### Changed

- Skill 1.1.0: the agent shows a preview and waits for a yes before scheduling, publishing or deleting, even when the user asked for it. It never schedules text the user hasn't seen, and it saves test posts as drafts.
- `server.json`: version 1.3.1, the first MCP Registry version that links this repository.
- README: reorganised into overview, features, platforms, tools, setup, authentication, client configuration, examples, permissions and security, troubleshooting, directories and support. The supported platforms are now a table with one row per platform.
