import { appendFileSync } from 'node:fs';

// Workflow command values must escape these characters, or the annotation is cut off.
const escapeData = (s) => String(s).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
const escapeProperty = (s) => escapeData(s).replace(/:/g, '%3A').replace(/,/g, '%2C');

/**
 * Collects check results, prints each one, and at the end writes a table to
 * the GitHub Actions job summary. `areas` maps an area key to its label.
 */
export function createReport(title, areas) {
  const results = [];
  const warnings = [];
  const inActions = process.env.GITHUB_ACTIONS === 'true';

  const status = (area) => {
    const own = results.filter((r) => r.area === area);
    if (!own.length) return '⏭️ Skipped';
    return own.every((r) => r.ok) ? '✅ Pass' : '❌ Fail';
  };

  return {
    pass(area, message) {
      results.push({ area, ok: true, message });
      console.log(`ok    [${areas[area]}] ${message}`);
    },

    fail(area, message, file) {
      results.push({ area, ok: false, message });
      console.log(`FAIL  [${areas[area]}] ${message}`);
      if (inActions) {
        const props = [file && `file=${escapeProperty(file)}`, `title=${escapeProperty(areas[area])}`];
        console.log(`::error ${props.filter(Boolean).join(',')}::${escapeData(message)}`);
      }
    },

    warn(message) {
      warnings.push(message);
      console.log(`warn  ${message}`);
      if (inActions) console.log(`::warning::${escapeData(message)}`);
    },

    failed() {
      return results.some((r) => !r.ok);
    },

    /** `facts` is a list of [label, value] rows shown above the per-area results. */
    summary(facts) {
      const failures = results.filter((r) => !r.ok);
      const md = [
        `## ${title}`,
        '',
        '| Check | Result |',
        '|---|---|',
        ...facts.map(([label, value]) => `| ${label} | ${value} |`),
        ...Object.keys(areas).map((area) => `| ${areas[area]} | ${status(area)} |`),
        '',
      ];
      if (failures.length) {
        md.push('### What failed', '', ...failures.map((f) => `- **${areas[f.area]}:** ${f.message}`), '');
      }
      if (warnings.length) {
        md.push('### Warnings', '', ...warnings.map((w) => `- ${w}`), '');
      }
      const text = md.join('\n');
      console.log(`\n${text}`);
      if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${text}\n`);
    },
  };
}
