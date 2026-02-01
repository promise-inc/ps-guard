# @promise-inc/ps-guard

Lighthouse-based performance guard. Enforce Web Vitals thresholds in CI and locally.

## Why ps-guard?

Running Lighthouse manually is tedious and inconsistent. `ps-guard` wraps Lighthouse into an opinionated CLI and API with:

- **Threshold enforcement** — fail CI if LCP, CLS, INP, TTFB, or FCP exceed your limits
- **Presets** — built-in configs for Next.js, landing pages, and marketing sites
- **Fix hints** — actionable suggestions when a metric fails
- **JSON output** — pipe results to dashboards or custom reporters
- **Zero config** — sensible defaults based on Google's Web Vitals recommendations

## Quick Start

### CLI

```bash
# Run with defaults (mobile, score >= 90)
npx ps-guard --url https://example.com

# Use a preset
npx ps-guard --url https://example.com --preset nextjs

# Desktop mode
npx ps-guard --url https://example.com --device desktop

# JSON output for CI pipelines
npx ps-guard --url https://example.com --json

# CI mode (no colors)
npx ps-guard --url https://example.com --ci
```

### Programmatic

```typescript
import { runPSGuard } from "@promise-inc/ps-guard";

const result = await runPSGuard("https://example.com", {
  device: "mobile",
  minScore: 90,
  preset: "nextjs",
});

if (!result.passed) {
  console.log("Performance check failed:", result.metrics);
}
```

## CLI Options

| Option | Description | Default |
|--------|-------------|---------|
| `--url <url>` | URL to audit (required) | — |
| `-p, --preset <name>` | Use a built-in preset | — |
| `--device <mobile\|desktop>` | Device emulation | `mobile` |
| `--retries <n>` | Retry attempts | `1` |
| `--json` | Output as JSON | `false` |
| `--ci` | No colors, clean output | `false` |
| `-h, --help` | Show help | — |

## Configuration

Create a `ps-guard.config.json` (or `.js`/`.ts`) in your project root:

```json
{
  "url": "https://example.com",
  "device": "mobile",
  "minScore": 90,
  "thresholds": {
    "lcp": 2500,
    "cls": 0.1,
    "inp": 200,
    "ttfb": 800,
    "fcp": 1800
  },
  "retries": 2
}
```

Or add to `package.json`:

```json
{
  "ps-guard": {
    "url": "https://example.com",
    "preset": "nextjs"
  }
}
```

### Config Cascade

Priority (highest to lowest):

1. CLI arguments
2. Config file (`ps-guard.config.*`)
3. `package.json` `"ps-guard"` field
4. Preset values
5. Defaults

## Presets

| Preset | Device | LCP | CLS | INP | TTFB | FCP |
|--------|--------|-----|-----|-----|------|-----|
| `nextjs` | mobile | 2500ms | 0.1 | 200ms | 800ms | 1800ms |
| `landing-page` | mobile | 1800ms | 0.05 | 100ms | 500ms | 1200ms |
| `marketing-site` | mobile | 2500ms | 0.1 | 200ms | 800ms | 1800ms |

## Default Thresholds

Based on [Google's Web Vitals recommendations](https://web.dev/vitals/):

| Metric | Limit | Description |
|--------|-------|-------------|
| LCP | 2500ms | Largest Contentful Paint |
| CLS | 0.1 | Cumulative Layout Shift |
| INP | 200ms | Interaction to Next Paint |
| TTFB | 800ms | Time to First Byte |
| FCP | 1800ms | First Contentful Paint |

## CI / GitHub Actions

```yaml
name: Performance Guard

on:
  pull_request:
    branches: [main]

jobs:
  perf:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Chrome
        uses: browser-actions/setup-chrome@v1

      - name: Install dependencies
        run: npm ci

      - name: Run ps-guard
        run: npx ps-guard --url https://staging.example.com --ci
```

## Requirements

- Node.js >= 18
- Chrome/Chromium installed (for Lighthouse)

## See Also

- [@promise-inc/ai-guard](https://github.com/promise-inc/ai-guard) — Detect AI-generated code patterns before commit/push
- [@promise-inc/dev-reel](https://github.com/promise-inc/dev-reel) — Animated SVG previews for READMEs
- [@promise-inc/devlog](https://github.com/promise-inc/devlog) — Simple logger with automatic context (file + line)
- [@promise-inc/fs-guard](https://github.com/promise-inc/fs-guard) — Validate project folder and file structure

## License

MIT
