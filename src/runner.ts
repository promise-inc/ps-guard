import type { PSGuardConfig } from "./types";

export interface LighthouseResult {
  lhr: {
    categories: {
      performance?: { score: number | null };
    };
    audits: Record<string, { numericValue?: number }>;
  };
}

export interface ChromeInstance {
  port: number;
  kill: () => void | Promise<void>;
}

function buildFlags(config: PSGuardConfig, port: number) {
  return {
    port,
    output: "json" as const,
    logLevel: "error" as const,
    formFactor: config.device === "mobile" ? "mobile" as const : "desktop" as const,
    screenEmulation: config.device === "mobile"
      ? { mobile: true, width: 375, height: 812, deviceScaleFactor: 3, disabled: false }
      : { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false },
    throttling: config.device === "mobile"
      ? undefined
      : { cpuSlowdownMultiplier: 1, downloadThroughputKbps: 0, uploadThroughputKbps: 0, rttMs: 0, requestLatencyMs: 0, throughputKbps: 0 },
  };
}

const LIGHTHOUSE_CONFIG = {
  extends: "lighthouse:default",
  settings: {
    onlyCategories: ["performance"],
  },
};

export async function launchChrome(): Promise<ChromeInstance> {
  const chromeLauncher = await import("chrome-launcher");
  const chrome = await chromeLauncher.launch({
    chromeFlags: ["--headless", "--no-sandbox", "--disable-gpu"],
  });
  return chrome;
}

export async function runSingleAudit(
  chrome: ChromeInstance,
  url: string,
  config: PSGuardConfig
): Promise<LighthouseResult> {
  const lighthouse = await import("lighthouse");
  const flags = buildFlags(config, chrome.port);

  let lastError: unknown;

  for (let attempt = 0; attempt < config.retries; attempt++) {
    try {
      const runFn = lighthouse.default ?? lighthouse;
      const result = await (runFn as Function)(url, flags, LIGHTHOUSE_CONFIG);
      return result as LighthouseResult;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`Lighthouse failed after ${config.retries} attempt(s)`);
}

export async function killChrome(chrome: ChromeInstance): Promise<void> {
  await chrome.kill();
}

export async function runLighthouse(config: PSGuardConfig): Promise<LighthouseResult> {
  const chrome = await launchChrome();

  try {
    return await runSingleAudit(chrome, config.url, config);
  } finally {
    await killChrome(chrome);
  }
}
