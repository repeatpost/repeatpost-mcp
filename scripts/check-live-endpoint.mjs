#!/usr/bin/env node
// Checks the live MCP endpoint's sign-in setup without any credentials:
// requests without a token must get a 401 that points to the OAuth metadata,
// and that metadata must match server.json and the README. It never signs in
// and never calls a tool, so it can't see or change any account.
//
//   npm run check-live

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createReport } from './report.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const server = JSON.parse(readFileSync(join(root, 'server.json'), 'utf8'));
const readme = readFileSync(join(root, 'README.md'), 'utf8');
const endpoint = server.remotes?.[0]?.url;

const report = createReport('Live endpoint check', {
  challenge: 'Unauthenticated requests get 401',
  resource: 'Protected resource metadata',
  issuer: 'Authorization server metadata',
  docs: 'Matches the README',
});

async function getJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return res.json();
}

/** Sends one request without a token and returns the resource_metadata URL from the 401. */
async function challenge(method) {
  const init = {
    method,
    headers: { Accept: 'application/json, text/event-stream' },
    signal: AbortSignal.timeout(20_000),
  };
  if (method === 'POST') {
    init.headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-06-18',
        capabilities: {},
        clientInfo: { name: 'repeatpost-mcp-live-check', version: '1' },
      },
    });
  }
  const res = await fetch(endpoint, init);
  await res.body?.cancel();
  const header = res.headers.get('www-authenticate') ?? '';
  const metadata = /resource_metadata="([^"]+)"/.exec(header)?.[1];
  if (res.status !== 401) {
    report.fail('challenge', `${method} ${endpoint} without a token returned ${res.status}, expected 401`);
  } else if (!/^Bearer\b/i.test(header) || !metadata) {
    report.fail('challenge', `${method} ${endpoint} returned 401 without a Bearer WWW-Authenticate header naming resource_metadata`);
  } else {
    report.pass('challenge', `${method} without a token gets 401 pointing to ${metadata}`);
  }
  return metadata;
}

/** RFC 8414: the well-known path goes between the host and any issuer path. */
function authServerMetadataUrl(issuer) {
  const u = new URL(issuer);
  const path = u.pathname === '/' ? '' : u.pathname.replace(/\/$/, '');
  return `${u.origin}/.well-known/oauth-authorization-server${path}`;
}

/** Scopes in the first column of the README's "Permissions (OAuth scopes)" table. */
function readmeScopes() {
  const lines = readme.split('\n');
  const start = lines.findIndex((l) => /^#{2,3} Permissions \(OAuth scopes\)\s*$/.test(l));
  if (start === -1) return undefined;
  const scopes = new Set();
  for (const line of lines.slice(start + 1)) {
    if (/^#{1,3} /.test(line)) break;
    const scope = /^\|\s*`([^`]+)`\s*\|/.exec(line)?.[1];
    if (scope) scopes.add(scope);
  }
  return scopes;
}

async function run() {
  if (typeof endpoint !== 'string') {
    report.fail('challenge', 'server.json has no remotes[0].url to check');
    return;
  }

  // Directories probe with GET, clients start with POST: both must be challenged.
  const fromGet = await challenge('GET');
  const fromPost = await challenge('POST');
  const metadataUrl = fromPost ?? fromGet;
  if (!metadataUrl) return;

  let resource;
  try {
    resource = await getJson(metadataUrl);
  } catch (err) {
    report.fail('resource', `could not read ${metadataUrl}: ${err.message}`);
    return;
  }
  if (resource.resource !== endpoint) {
    report.fail('resource', `"resource" is ${JSON.stringify(resource.resource)}, but server.json says ${endpoint}`);
  } else if (!Array.isArray(resource.authorization_servers) || !resource.authorization_servers.length) {
    report.fail('resource', 'authorization_servers is missing or empty');
  } else {
    report.pass('resource', `resource is ${endpoint}, authorization server ${resource.authorization_servers[0]}`);
  }

  const scopes = readmeScopes();
  if (!scopes) {
    report.fail('docs', 'README has no "Permissions (OAuth scopes)" table to compare with');
  } else if (!Array.isArray(resource.scopes_supported)) {
    report.warn('the protected resource metadata has no scopes_supported, so the README scopes were not compared');
  } else {
    const live = new Set(resource.scopes_supported);
    const missing = [...live].filter((s) => !scopes.has(s));
    const extra = [...scopes].filter((s) => !live.has(s));
    if (missing.length || extra.length) {
      report.fail(
        'docs',
        'README scopes differ from the live server' +
          (missing.length ? `; not documented: ${missing.join(', ')}` : '') +
          (extra.length ? `; documented but not offered: ${extra.join(', ')}` : ''),
      );
    } else {
      report.pass('docs', `README documents exactly the ${live.size} live scopes`);
    }
  }

  const issuer = resource.authorization_servers?.[0];
  if (!issuer) return;
  const asUrl = authServerMetadataUrl(issuer);
  let as;
  try {
    as = await getJson(asUrl);
  } catch (err) {
    report.fail('issuer', `could not read ${asUrl}: ${err.message}`);
    return;
  }

  const problems = [];
  if (as.issuer !== issuer) problems.push(`issuer is ${JSON.stringify(as.issuer)}, expected ${issuer}`);
  for (const field of ['authorization_endpoint', 'token_endpoint', 'registration_endpoint']) {
    if (typeof as[field] !== 'string') problems.push(`${field} is missing`);
  }
  if (!as.code_challenge_methods_supported?.includes('S256')) problems.push('code_challenge_methods_supported does not include S256');
  if (!as.response_types_supported?.includes('code')) problems.push('response_types_supported does not include code');
  if (problems.length) {
    for (const p of problems) report.fail('issuer', p);
  } else {
    report.pass('issuer', 'authorization code flow with PKCE S256 and dynamic client registration');
  }

  const endpoints = ['authorization_endpoint', 'token_endpoint', 'registration_endpoint', 'revocation_endpoint']
    .map((field) => as[field])
    .filter((url) => typeof url === 'string');
  const undocumented = endpoints.filter((url) => !readme.includes(url));
  if (undocumented.length) report.fail('docs', `OAuth endpoints missing from the README: ${undocumented.join(', ')}`);
  else report.pass('docs', `README lists all ${endpoints.length} OAuth endpoints`);
}

try {
  await run();
} catch (err) {
  report.fail('challenge', `request failed: ${err.message}`);
}

report.summary([
  ['Endpoint', endpoint ? `\`${endpoint}\`` : 'unknown'],
  ['Server version in server.json', server.version ?? 'unknown'],
]);

process.exitCode = report.failed() ? 1 : 0;
