#!/usr/bin/env node

import { loadConfig } from "./config";
import { runLighthouse } from "./runner";
import { validateResults } from "./validator";
import { reportHuman, reportJSON } from "./reporter";
import { presetNames } from "./presets/registry";
import { setCIMode, printError } from "./utils/output";
import type { CLIArgs } from "./types";

function parseArgs(args: string[]): CLIArgs {
  let url: string | undefined;
  let preset: string | undefined;
  let device: "mobile" | "desktop" | undefined;
  let json = false;
  let ci = false;
  let help = false;
  let retries: number | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--url") {
      url = args[i + 1];
      i++;
    } else if (arg === "--preset" || arg === "-p") {
      preset = args[i + 1];
      i++;
    } else if (arg === "--device") {
      const val = args[i + 1];
      if (val === "mobile" || val === "desktop") {
        device = val;
      }
      i++;
    } else if (arg === "--json") {
      json = true;
    } else if (arg === "--ci") {
      ci = true;
    } else if (arg === "--help" || arg === "-h") {
      help = true;
    } else if (arg === "--retries") {
      const val = parseInt(args[i + 1], 10);
      if (!isNaN(val) && val > 0) {
        retries = val;
      }
      i++;
    }
  }

  return { url, preset, device, json, ci, help, retries };
}

function printHelp(): void {
  console.log(`
  \x1b[1m\x1b[36mps-guard\x1b[0m — Lighthouse-based performance guard

  \x1b[1mUsage:\x1b[0m
    npx ps-guard --url https://example.com
    npx ps-guard --url https://example.com --preset nextjs
    npx ps-guard --url https://example.com --json

  \x1b[1mOptions:\x1b[0m
    --url <url>             URL to audit (required)
    -p, --preset <name>     Use a built-in preset
    --device <mobile|desktop>  Device emulation (default: mobile)
    --retries <n>           Number of retry attempts (default: 1)
    --json                  Output results as JSON
    --ci                    CI mode (no colors, clean output)
    -h, --help              Show this help message

  \x1b[1mPresets:\x1b[0m
    ${presetNames.join(", ")}

  \x1b[1mConfig files:\x1b[0m
    ps-guard.config.ts | ps-guard.config.js | ps-guard.config.json | package.json

  \x1b[1mThresholds (defaults):\x1b[0m
    LCP   2500ms    Largest Contentful Paint
    CLS   0.1       Cumulative Layout Shift
    INP   200ms     Interaction to Next Paint
    TTFB  800ms     Time to First Byte
    FCP   1800ms    First Contentful Paint
`);
}

async function main(): Promise<void> {
  const parsed = parseArgs(process.argv.slice(2));

  if (parsed.help) {
    printHelp();
    return;
  }

  if (parsed.ci) {
    setCIMode(true);
  }

  try {
    const cwd = process.cwd();
    const config = loadConfig(cwd, {
      url: parsed.url,
      preset: parsed.preset,
      device: parsed.device,
      retries: parsed.retries,
    });

    const lighthouseResult = await runLighthouse(config);
    const result = validateResults(lighthouseResult.lhr, config);

    if (parsed.json) {
      reportJSON(result);
    } else {
      reportHuman(result);
    }

    if (!result.passed) {
      process.exit(1);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    printError(message);
    process.exit(2);
  }
}

main();
