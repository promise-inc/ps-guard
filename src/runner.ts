import type { PSGuardConfig } from "./types";

interface LighthouseResult {
  lhr: {
    categories: {
      performance?: { score: number | null };
    };
    audits: Record<string, { numericValue?: number }>;
  };
}

export async function runLighthouse(config: PSGuardConfig): Promise<LighthouseResult> {
  const chromeLauncher = await import("chrome-launcher");
  const lighthouse = await import("lighthouse");

  const chrome = await chromeLauncher.launch({
    chromeFlags: ["--headless", "--no-sandbox", "--disable-gpu"],
  });

  const flags = {
    port: chrome.port,
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

  const lighthouseConfig = {
    extends: "lighthouse:default",
    settings: {
      onlyCategories: ["performance"],
    },
  };

  let lastError: unknown;

  for (let attempt = 0; attempt < config.retries; attempt++) {
    try {
      const runFn = lighthouse.default ?? lighthouse;
      const result = await (runFn as Function)(config.url, flags, lighthouseConfig);
      await chrome.kill();
      return result as LighthouseResult;
    } catch (error) {
      lastError = error;
    }
  }

  await chrome.kill();
  throw lastError instanceof Error
    ? lastError
    : new Error(`Lighthouse failed after ${config.retries} attempt(s)`);
}
