# Security policy

## Scope

This policy covers:

- the hosted RepeatPost MCP server at `https://api.repeatpost.com/mcp`, and the OAuth endpoints it uses on `api.repeatpost.com`
- the contents of this repository

This repository holds documentation and metadata only. The server's code is not published here.

## Report a vulnerability

Email **[support@repeatpost.com](mailto:support@repeatpost.com)** with "Security" in the subject line. Please don't report vulnerabilities in a public GitHub issue, pull request or discussion.

The same contact is published in machine-readable form at [`https://api.repeatpost.com/.well-known/security.txt`](https://api.repeatpost.com/.well-known/security.txt).

Please include:

- what is affected: a URL, an OAuth endpoint or a tool name
- the steps to reproduce it
- what an attacker could do with it
- how we can reach you

## Never send credentials

Don't include real access tokens, refresh tokens, authorization codes, passwords, API keys or other people's data in a report. If a token is part of the problem, describe it or redact it. RepeatPost will never ask you for your password or for an active token.

## Testing

Please test only with your own RepeatPost account and workspaces. Don't access or change other people's data, and don't run tests that degrade the service for others, such as load tests or high-volume automated scans.

## Supported versions

Only the current production deployment of the hosted server is supported. Its version is the `version` field in [`server.json`](server.json).
