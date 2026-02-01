import * as fs from "node:fs";
import * as path from "node:path";
import type { PSGuardConfig, PSGuardThresholds } from "./types";
import { presets } from "./presets/registry";

const DEFAULT_THRESHOLDS: PSGuardThresholds = {
  lcp: 2500,
  cls: 0.1,
  inp: 200,
  ttfb: 800,
  fcp: 1800,
};

const DEFAULT_CONFIG: Omit<PSGuardConfig, "url"> = {
  device: "mobile",
  minScore: 90,
  thresholds: DEFAULT_THRESHOLDS,
  failOnError: true,
  retries: 1,
};

const CONFIG_FILES = [
  "ps-guard.config.ts",
  "ps-guard.config.js",
  "ps-guard.config.json",
];

function loadConfigFile(cwd: string): Partial<PSGuardConfig> | undefined {
  for (const file of CONFIG_FILES) {
    const filePath = path.join(cwd, file);
    if (fs.existsSync(filePath)) {
      if (file.endsWith(".json")) {
        const content = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(content) as Partial<PSGuardConfig>;
      }
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const loaded = require(filePath);
      return (loaded.default ?? loaded) as Partial<PSGuardConfig>;
    }
  }

  const pkgPath = path.join(cwd, "package.json");
  if (fs.existsSync(pkgPath)) {
    const content = fs.readFileSync(pkgPath, "utf-8");
    const pkg = JSON.parse(content) as Record<string, unknown>;
    if (pkg["ps-guard"] && typeof pkg["ps-guard"] === "object") {
      return pkg["ps-guard"] as Partial<PSGuardConfig>;
    }
  }

  return undefined;
}

export function resolvePreset(name: string): Partial<PSGuardConfig> {
  const preset = presets[name];
  if (!preset) {
    throw new Error(
      `Unknown preset "${name}". Available: ${Object.keys(presets).join(", ")}`
    );
  }
  return {
    device: preset.device,
    thresholds: { ...preset.thresholds },
  };
}

export function loadConfig(
  cwd: string,
  overrides: Partial<PSGuardConfig> = {}
): PSGuardConfig {
  const fileConfig = loadConfigFile(cwd) ?? {};

  let presetConfig: Partial<PSGuardConfig> = {};
  const presetName = overrides.preset ?? fileConfig.preset;
  if (presetName) {
    presetConfig = resolvePreset(presetName);
  }

  const sitemap = overrides.sitemap ?? fileConfig.sitemap;
  const url = overrides.url ?? fileConfig.url ?? "";

  const merged: PSGuardConfig = {
    url,
    device: overrides.device ?? fileConfig.device ?? presetConfig.device ?? DEFAULT_CONFIG.device,
    minScore: overrides.minScore ?? fileConfig.minScore ?? DEFAULT_CONFIG.minScore,
    thresholds: {
      ...DEFAULT_THRESHOLDS,
      ...presetConfig.thresholds,
      ...fileConfig.thresholds,
      ...overrides.thresholds,
    },
    failOnError: overrides.failOnError ?? fileConfig.failOnError ?? DEFAULT_CONFIG.failOnError,
    retries: overrides.retries ?? fileConfig.retries ?? DEFAULT_CONFIG.retries,
    preset: presetName,
    sitemap,
    report: overrides.report ?? fileConfig.report,
    html: overrides.html ?? fileConfig.html,
    maxUrls: overrides.maxUrls ?? fileConfig.maxUrls,
  };

  if (!merged.url && !merged.sitemap) {
    throw new Error("URL or sitemap is required. Use --url <url> or --sitemap <url>.");
  }

  return merged;
}
