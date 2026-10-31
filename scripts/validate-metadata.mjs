#!/usr/bin/env node
// Checks that server.json, tools.json and README.md are valid and agree with
// each other. Expected values live in scripts/expected.json. Read-only: it
// never changes a file.
//
//   npm ci
//   npm run validate
//
// The README conventions it relies on are described in CONTRIBUTING.md.

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { createReport } from './report.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const report = createReport('Metadata validation', {
  json: 'JSON validation',
  schema: 'Schema validation',
  server: 'server.json rules',
  tools: 'tools.json',
  readme: 'README consistency',
});

const SCHEMA_URL = /^https:\/\/static\.modelcontextprotocol\.io\/schemas\/[^/]+\/server\.schema\.json$/;
// MCP tool names: 1-128 characters from this set.
const TOOL_NAME = /^[A-Za-z0-9_.-]{1,128}$/;
const ANNOTATION_TYPES = {
  title: 'string',
  readOnlyHint: 'boolean',
  destructiveHint: 'boolean',
  idempotentHint: 'boolean',
  openWorldHint: 'boolean',
};

const expected = JSON.parse(readFileSync(join(root, 'scripts/expected.json'), 'utf8'));
for (const [env, key] of [
  ['EXPECTED_TOOL_COUNT', 'toolCount'],
  ['EXPECTED_PLATFORM_COUNT', 'platformCount'],
]) {
  if (process.env[env]) expected[key] = Number(process.env[env]);
}

function readJson(file) {
  try {
    const value = JSON.parse(readFileSync(join(root, file), 'utf8'));
    report.pass('json', `${file} is valid JSON`);
    return value;
  } catch (err) {
    report.fail('json', `${file} is not valid JSON: ${err.message}`, file);
    return undefined;
  }
}

function newAjv(AjvClass = Ajv) {
  // strict: false, because official schemas may use keywords Ajv doesn't know.
  const ajv = new AjvClass({ allErrors: true, strict: false });
  addFormats(ajv);
  return ajv;
}

async function ajvClassFor(metaSchema = '') {
  if (metaSchema.includes('2020-12')) return (await import('ajv/dist/2020.js')).default;
  if (metaSchema.includes('2019-09')) return (await import('ajv/dist/2019.js')).default;
  return Ajv;
}

// ---- server.json ----------------------------------------------------------

async function checkServerSchema(server) {
  const url = server.$schema;
  if (typeof url !== 'string' || !SCHEMA_URL.test(url)) {
    report.fail('schema', `"$schema" must be an official MCP Registry schema URL, got ${JSON.stringify(url)}`, 'server.json');
    return;
  }

  let schema;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    schema = await res.json();
  } catch (err) {
    report.fail('schema', `could not download the schema ${url}: ${err.message}`, 'server.json');
    return;
  }

  let validate;
  try {
    validate = newAjv(await ajvClassFor(schema.$schema)).compile(schema);
  } catch (err) {
    report.fail('schema', `could not compile the schema ${url}: ${err.message}`, 'server.json');
    return;
  }

  if (validate(server)) {
    report.pass('schema', `server.json matches ${url}`);
    return;
  }
  for (const e of validate.errors.slice(0, 20)) {
    report.fail('schema', `server.json${e.instancePath || ''} ${e.message} ${JSON.stringify(e.params)}`, 'server.json');
  }
}

function checkServerRules(server) {
  let failedHere = false;
  const check = (ok, message) => {
    if (!ok) {
      report.fail('server', message, 'server.json');
      failedHere = true;
    }
  };

  check(server.name === expected.serverName, `name must be "${expected.serverName}", got ${JSON.stringify(server.name)}`);
  check(
    /^\d+\.\d+\.\d+$/.test(server.version ?? ''),
    `version must be a plain release version such as 1.3.0, so the registry marks it latest. Got ${JSON.stringify(server.version)}`,
  );
  check(
    typeof server.description === 'string' && server.description.trim() !== '' && server.description.length <= 100,
    `description must be 1 to 100 characters, got ${JSON.stringify(server.description)}`,
  );
  check(
    typeof server.websiteUrl === 'string' && server.websiteUrl.startsWith('https://'),
    `websiteUrl must be an https URL, got ${JSON.stringify(server.websiteUrl)}`,
  );
  check(
    server.repository?.url === expected.repositoryUrl && server.repository?.source === 'github',
    `repository must be { "url": "${expected.repositoryUrl}", "source": "github" }, got ${JSON.stringify(server.repository)}`,
  );

  const remotes = server.remotes;
  check(Array.isArray(remotes) && remotes.length === 1, `remotes must list exactly one endpoint, got ${JSON.stringify(remotes)}`);
  if (Array.isArray(remotes) && remotes.length === 1) {
    check(remotes[0].type === 'streamable-http', `remotes[0].type must be "streamable-http", got ${JSON.stringify(remotes[0].type)}`);
    check(remotes[0].url === expected.remoteUrl, `remotes[0].url must be "${expected.remoteUrl}", got ${JSON.stringify(remotes[0].url)}`);
  }
  check(
    !/staging|localhost|127\.0\.0\.1|railway\.app/i.test(JSON.stringify(server)),
    'server.json must not mention staging, localhost or railway.app addresses',
  );

  if (!failedHere) {
    report.pass('server', `name, version ${server.version}, description, website, repository and the ${expected.remoteUrl} endpoint are as expected`);
  }
}

// ---- tools.json -----------------------------------------------------------

function checkTools(doc) {
  const fail = (message) => report.fail('tools', message, 'tools.json');
  const tools = doc?.tools;
  if (!Array.isArray(tools)) {
    fail('tools.json must be an object with a "tools" array');
    return undefined;
  }

  const ajv = newAjv();
  const counts = new Map();
  let problems = 0;
  const problem = (message) => {
    fail(message);
    problems += 1;
  };

  tools.forEach((tool, i) => {
    const label = typeof tool?.name === 'string' && tool.name ? tool.name : `tools[${i}]`;

    if (typeof tool?.name !== 'string' || !TOOL_NAME.test(tool.name)) {
      problem(`${label}: name must be 1-128 characters of A-Z, a-z, 0-9, "_", "-" or "."`);
    } else {
      counts.set(tool.name, (counts.get(tool.name) ?? 0) + 1);
    }

    if (typeof tool?.description !== 'string' || !tool.description.trim()) {
      problem(`${label}: description is missing or empty`);
    }
    if (tool?.title !== undefined && typeof tool.title !== 'string') {
      problem(`${label}: title must be a string`);
    }

    const schema = tool?.inputSchema;
    if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
      problem(`${label}: inputSchema is missing`);
    } else if (schema.type !== 'object') {
      problem(`${label}: inputSchema.type must be "object", got ${JSON.stringify(schema.type)}`);
    } else {
      try {
        ajv.compile(schema);
      } catch (err) {
        problem(`${label}: inputSchema is not a valid JSON Schema: ${err.message}`);
      }
    }

    const annotations = tool?.annotations;
    if (annotations !== undefined) {
      if (!annotations || typeof annotations !== 'object' || Array.isArray(annotations)) {
        problem(`${label}: annotations must be an object`);
      } else {
        for (const [key, value] of Object.entries(annotations)) {
          if (!(key in ANNOTATION_TYPES)) {
            report.warn(`${label}: annotation "${key}" is not one of ${Object.keys(ANNOTATION_TYPES).join(', ')}`);
          } else if (typeof value !== ANNOTATION_TYPES[key]) {
            problem(`${label}: annotation "${key}" must be a ${ANNOTATION_TYPES[key]}, got ${JSON.stringify(value)}`);
          }
        }
      }
    }
  });

  const duplicates = [...counts].filter(([, n]) => n > 1).map(([name]) => name);
  if (duplicates.length) problem(`duplicate tool names: ${duplicates.join(', ')}`);

  if (tools.length !== expected.toolCount) {
    problem(
      `expected ${expected.toolCount} tools but tools.json has ${tools.length}. ` +
        'If a tool was added or removed on purpose, update toolCount in scripts/expected.json in the same change.',
    );
  }

  if (!problems) {
    report.pass('tools', `${tools.length} tools, all unique, each with a description, a valid input schema and valid annotations`);
  }
  return tools;
}

// ---- README.md ------------------------------------------------------------

/** Drops HTML comments and fenced code blocks, so only rendered prose is checked. */
function prose(markdown) {
  return markdown.replace(/<!--[\s\S]*?-->/g, '').replace(/^```[^\n]*\n[\s\S]*?^```[^\n]*$/gm, '');
}

/** The lines under a "## Title" heading, up to the next level-1 or level-2 heading. */
function section(lines, title) {
  const start = lines.findIndex((l) => l.trim().toLowerCase() === `## ${title}`.toLowerCase());
  if (start === -1) return undefined;
  const end = lines.findIndex((l, i) => i > start && /^#{1,2} /.test(l));
  return lines.slice(start + 1, end === -1 ? undefined : end);
}

/** Body rows of every Markdown table in `lines`, as arrays of trimmed cells. */
function tableRows(lines) {
  const rows = [];
  for (let i = 0; i < lines.length; i += 1) {
    const isSeparator = /^\|[\s:|-]+\|\s*$/.test(lines[i]);
    if (!isSeparator) continue;
    for (let j = i + 1; j < lines.length && lines[j].trim().startsWith('|'); j += 1) {
      rows.push(lines[j].trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));
    }
  }
  return rows;
}

/** GitHub's heading anchors: lower case, punctuation dropped, spaces to hyphens. */
function anchors(lines) {
  const seen = new Map();
  const result = new Set();
  for (const line of lines) {
    const m = /^#{1,6}\s+(.+?)\s*#*\s*$/.exec(line);
    if (!m) continue;
    const base = m[1]
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s_-]/gu, '')
      .replace(/\s/g, '-');
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    result.add(n ? `${base}-${n}` : base);
  }
  return result;
}

function sameSet(a, b) {
  const missing = [...b].filter((x) => !a.has(x));
  const extra = [...a].filter((x) => !b.has(x));
  return { missing, extra };
}

function checkReadme(tools) {
  const fail = (message) => report.fail('readme', message, 'README.md');
  const pass = (message) => report.pass('readme', message);
  const raw = readFileSync(join(root, 'README.md'), 'utf8');
  const text = prose(raw);
  const lines = text.split('\n');

  if (!raw.includes(expected.serverName)) fail(`README doesn't mention the MCP Registry name ${expected.serverName}`);
  if (!raw.includes(expected.remoteUrl)) fail(`README doesn't mention the server URL ${expected.remoteUrl}`);

  // Tools: every tool in tools.json appears once in the MCP tools tables.
  const toolLines = section(lines, 'MCP tools');
  if (!toolLines) {
    fail('README has no "## MCP tools" section');
  } else if (tools) {
    const listed = tableRows(toolLines)
      .map((cells) => /^`([^`]+)`$/.exec(cells[0])?.[1])
      .filter(Boolean);
    const dupes = listed.filter((name, i) => listed.indexOf(name) !== i);
    const { missing, extra } = sameSet(new Set(listed), new Set(tools.map((t) => t.name)));
    if (missing.length) fail(`tools in tools.json missing from the README tool tables: ${missing.join(', ')}`);
    if (extra.length) fail(`tools in the README tool tables that aren't in tools.json: ${extra.join(', ')}`);
    if (dupes.length) fail(`tools listed more than once in the README tool tables: ${[...new Set(dupes)].join(', ')}`);
    if (!missing.length && !extra.length && !dupes.length) pass(`the MCP tools tables list exactly the ${tools.length} tools in tools.json`);

    const destructiveLine = toolLines.find((l) => l.includes('`destructiveHint: true`'));
    const destructive = new Set(tools.filter((t) => t.annotations?.destructiveHint === true).map((t) => t.name));
    if (!destructiveLine) {
      fail('the MCP tools section has no line listing the tools marked `destructiveHint: true`');
    } else {
      const named = new Set(
        [...destructiveLine.matchAll(/`([^`]+)`/g)].map((m) => m[1]).filter((s) => s !== 'destructiveHint: true'),
      );
      const diff = sameSet(named, destructive);
      if (diff.missing.length || diff.extra.length) {
        fail(
          `the destructiveHint line doesn't match tools.json` +
            (diff.missing.length ? `; missing: ${diff.missing.join(', ')}` : '') +
            (diff.extra.length ? `; not destructive in tools.json: ${diff.extra.join(', ')}` : ''),
        );
      } else {
        pass(`the destructiveHint line lists exactly the ${destructive.size} destructive tools`);
      }
    }
  }

  if (tools) {
    const stated = [...text.matchAll(/\b(\d+)\s+tools\b/gi), ...text.matchAll(/\*\*Tools\*\*\s*\|\s*(\d+)/g)].map((m) => Number(m[1]));
    const wrong = stated.filter((n) => n !== tools.length);
    if (!stated.length) fail(`README never states the tool count (write it as "${tools.length} tools")`);
    else if (wrong.length) fail(`README states ${[...new Set(wrong)].join(', ')} tools, but tools.json has ${tools.length}`);
    else pass(`every tool count in the README says ${tools.length}`);
  }

  // Platforms: one table row per platform.
  let platformCount;
  const platformLines = section(lines, 'Supported social media platforms');
  if (!platformLines) {
    fail('README has no "## Supported social media platforms" section');
  } else {
    const names = tableRows(platformLines).map((cells) => cells[0]).filter(Boolean);
    platformCount = names.length;
    const dupes = names.filter((name, i) => names.indexOf(name) !== i);
    if (dupes.length) fail(`platforms listed more than once: ${[...new Set(dupes)].join(', ')}`);
    if (platformCount !== expected.platformCount) {
      fail(
        `expected ${expected.platformCount} platforms but the platforms table has ${platformCount}. ` +
          'If a platform was added or removed on purpose, update platformCount in scripts/expected.json.',
      );
    }
    const stated = [...text.matchAll(/\b(\d+)\s+platforms\b/gi), ...text.matchAll(/\*\*Platforms\*\*\s*\|\s*(\d+)/g)].map((m) =>
      Number(m[1]),
    );
    const wrong = stated.filter((n) => n !== platformCount);
    if (!stated.length) fail(`README never states the platform count (write it as "${platformCount} platforms")`);
    else if (wrong.length) fail(`README states ${[...new Set(wrong)].join(', ')} platforms, but the platforms table has ${platformCount}`);
    if (!dupes.length && platformCount === expected.platformCount && stated.length && !wrong.length) {
      pass(`the platforms table has ${platformCount} platforms, matching every platform count in the README`);
    }
  }

  // Links inside the repository: #anchors and relative files.
  const known = anchors(lines);
  const targets = [
    ...[...text.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)].map((m) => m[1]),
    ...[...text.matchAll(/\b(?:href|src)="([^"]+)"/g)].map((m) => m[1]),
  ];
  const broken = [];
  for (const target of targets) {
    if (target.startsWith('#')) {
      if (!known.has(decodeURIComponent(target.slice(1)))) broken.push(target);
    } else if (!/^[a-z][a-z0-9+.-]*:/i.test(target)) {
      const path = decodeURIComponent(target.split('#')[0].split('?')[0]);
      if (path && !existsSync(join(root, path))) broken.push(target);
    }
  }
  if (broken.length) fail(`links that point nowhere: ${[...new Set(broken)].join(', ')}`);
  else pass(`all ${targets.filter((t) => !/^[a-z][a-z0-9+.-]*:/i.test(t)).length} internal links and anchors resolve`);

  return platformCount;
}

// ---- run ------------------------------------------------------------------

const server = readJson('server.json');
const toolsDoc = readJson('tools.json');

if (server) {
  await checkServerSchema(server);
  checkServerRules(server);
}
const tools = toolsDoc ? checkTools(toolsDoc) : undefined;
const platformCount = checkReadme(tools);

report.summary([
  ['Server name', server?.name ? `\`${server.name}\`` : 'unknown'],
  ['Server version', server?.version ?? 'unknown'],
  ['Total tools', tools ? `${tools.length} (expected ${expected.toolCount})` : 'unknown'],
  ['Unique tools', tools ? String(new Set(tools.map((t) => t?.name)).size) : 'unknown'],
  ['Supported platforms', platformCount === undefined ? 'unknown' : `${platformCount} (expected ${expected.platformCount})`],
]);

process.exitCode = report.failed() ? 1 : 0;
