# Skill evals

Tests for the [`repeatpost-social-media-manager`](../SKILL.md) skill. They're installed with the skill, but agents don't load them: `SKILL.md` never points to them. They're for whoever changes the skill, to check that it still behaves correctly.

| File | What it tests | Format |
|---|---|---|
| [`evals.json`](evals.json) | Behaviour: 8 scenarios covering previews and confirmation, test posts, UTC times, publishing, deleting, instructions inside posts, AI credits, and a missing connection | skill-creator `evals.json`, plus a `name` and an optional `setup` per eval |
| [`trigger-evals.json`](trigger-evals.json) | When the skill loads: 10 requests that should use it and 10 near-misses that shouldn't | skill-creator trigger eval set |

Both formats come from Anthropic's [skill-creator](https://github.com/anthropics/skills/tree/main/skills/skill-creator), and this is the location it expects (`evals/evals.json` inside the skill folder).

## When to run them

- After any change to the skill, including its description.
- After a RepeatPost tool changes. The tool list is in [`tools.json`](https://github.com/repeatpost/repeatpost-mcp/blob/main/tools.json).
- When you find a bug: first add an eval that reproduces it, then fix the skill and check that the eval passes. Eval 2 reproduces the "test post was scheduled without asking" bug found on 2 November 2026.

## Safety: use a test workspace

These evals run a real agent against the real RepeatPost server. **A failing eval can schedule, publish or delete real posts.**

- Use a RepeatPost workspace that's only for testing, with channels you don't mind posting to, such as a private test account. Never use a workspace with your company's or a customer's channels.
- Before a run, do each eval's `setup`:
  - Eval 4: create a LinkedIn draft.
  - Eval 5: create a scheduled LinkedIn post about a webinar.
  - Eval 6: write the draft it describes, with an instruction to AI assistants hidden in it.
  - Eval 8: disconnect the MCP server.
- Answer "no" to every confirmation question during a run.
- After a run, list the workspace's posts and delete anything the run created.

## Run them with skill-creator (recommended)

skill-creator runs each prompt with and without the skill, grades the expectations, and shows a report.

1. Install it: `npx skills add anthropics/skills --skill skill-creator -a claude-code`
2. In Claude Code, connected to the test workspace, ask:
   *"Use skill-creator to run the evals for the repeatpost-social-media-manager skill, and show me the benchmark."*
3. To test when the skill loads, ask:
   *"Use skill-creator to evaluate triggering for repeatpost-social-media-manager with its evals/trigger-evals.json."*
   It runs each request several times. If it suggests a new description, review it before using it, and keep the skill's rules in the description.

## Run them by hand

For each eval in `evals.json`:

1. Do its `setup`, if it has one.
2. Start a new agent session where the skill is installed and paste the `prompt`.
3. Answer "no" if you're asked to confirm anything.
4. Mark each expectation pass or fail, based on the tool calls and the final message.

An eval passes when all its expectations pass.

## Add an eval

- Use the next `id`, a short `name`, a realistic `prompt`, an `expected_output`, and `expectations` that can be checked from the tool calls and the final message.
- Add a `setup` when the eval needs data in the workspace. Describe harmful test content, such as an injection, instead of writing it out.
- Put tool and parameter names in backticks. The repository's `npm run validate` checks that they exist in `tools.json`, along with the format of both files.
