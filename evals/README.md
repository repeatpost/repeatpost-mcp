# Skill evals

Tests for the [`repeatpost-social-media-manager`](../skills/repeatpost-social-media-manager/SKILL.md) agent skill. They aren't part of the skill itself. Installers copy only `skills/<name>/`, so these files never reach users, and security scanners don't read them as part of the skill. One eval contains a deliberate prompt-injection text.

| File | What it tests | Format |
|---|---|---|
| [`repeatpost-social-media-manager/evals.json`](repeatpost-social-media-manager/evals.json) | Behaviour: 8 scenarios covering previews and confirmation, test posts, UTC times, publishing, deleting, instructions inside posts, AI credits, and a missing connection | skill-creator `evals.json`, plus a `name` and an optional `setup` per eval |
| [`repeatpost-social-media-manager/trigger-evals.json`](repeatpost-social-media-manager/trigger-evals.json) | When the skill loads: 10 requests that should use it and 10 near-misses that shouldn't | skill-creator trigger eval set |

Both formats come from Anthropic's [skill-creator](https://github.com/anthropics/skills/tree/main/skills/skill-creator), so its tools can run them.

## When to run them

- After any change to the skill, including its description.
- After a tool in [`tools.json`](../tools.json) changes.
- When you find a bug: first add an eval that reproduces it, then fix the skill and check that the eval passes. Eval 2 reproduces the "test post was scheduled without asking" bug found on 2 November 2026.

## Safety: use a test workspace

These evals run a real agent against the real RepeatPost server. **A failing eval can schedule, publish or delete real posts.**

- Use a RepeatPost workspace that's only for testing, with channels you don't mind posting to, such as a private test account. Never use a workspace with your company's or a customer's channels.
- Before a run, do each eval's `setup`:
  - Eval 4: create a LinkedIn draft.
  - Eval 5: create a scheduled LinkedIn post about a webinar.
  - Eval 6: create a draft containing the injection text.
  - Eval 8: disconnect the MCP server.
- Answer "no" to every confirmation question during a run.
- After a run, list the workspace's posts and delete anything the run created.

## Run them with skill-creator (recommended)

skill-creator runs each prompt with and without the skill, grades the expectations, and shows a report.

1. Install it: `npx skills add anthropics/skills --skill skill-creator -a claude-code`
2. In Claude Code, connected to the test workspace, from this repository's folder, ask:
   *"Use skill-creator to run the evals in evals/repeatpost-social-media-manager/evals.json against skills/repeatpost-social-media-manager, and show me the benchmark."*
3. To test when the skill loads, ask:
   *"Use skill-creator to evaluate triggering for skills/repeatpost-social-media-manager with evals/repeatpost-social-media-manager/trigger-evals.json."*
   It runs each request several times. If it suggests a new description, review it before using it, and keep the skill's rules in the description.

skill-creator normally looks for `evals/evals.json` inside the skill folder. These files live here instead, so name them in your request, as above.

## Run them by hand

For each eval in `evals.json`:

1. Do its `setup`, if it has one.
2. Start a new agent session where the skill is installed and paste the `prompt`.
3. Answer "no" if you're asked to confirm anything.
4. Mark each expectation pass or fail, based on the tool calls and the final message.

An eval passes when all its expectations pass.

## Add an eval

- Use the next `id`, a short `name`, a realistic `prompt`, an `expected_output`, and `expectations` that can be checked from the tool calls and the final message.
- Add a `setup` when the eval needs data in the workspace.
- Put tool and parameter names in backticks. `npm run validate` checks that they exist in `tools.json`, along with the format of both files.
