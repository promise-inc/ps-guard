import type { PSGuardConfig, PSGuardMultiResult, PSGuardResult } from "./types";
import { launchChrome, runSingleAudit, killChrome } from "./runner";
import { validateResults } from "./validator";
import { printScanStart, printUrlResult, printUrlError, printMultiSummary } from "./utils/progress";

const DEFAULT_MAX_URLS = 50;

interface OrchestratorOptions {
  urls: string[];
  config: PSGuardConfig;
  maxUrls?: number;
  silent?: boolean;
}

export async function runMultiAudit(options: OrchestratorOptions): Promise<PSGuardMultiResult> {
  const { config, silent } = options;
  const maxUrls = options.maxUrls ?? config.maxUrls ?? DEFAULT_MAX_URLS;
  const urls = options.urls.slice(0, maxUrls);

  if (!silent) {
    printScanStart(urls.length);
  }

  const chrome = await launchChrome();
  const results: PSGuardResult[] = [];

  try {
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      try {
        const lighthouseResult = await runSingleAudit(chrome, url, config);
        const result = validateResults(lighthouseResult.lhr, { ...config, url });

        results.push(result);

        if (!silent) {
          printUrlResult(i + 1, urls.length, result.score, url, result.passed);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        results.push({
          passed: false,
          score: 0,
          minScore: config.minScore,
          metrics: [],
          url,
          device: config.device,
        });

        if (!silent) {
          printUrlError(i + 1, urls.length, url, message);
        }
      }
    }
  } finally {
    await killChrome(chrome);
  }

  const passedUrls = results.filter((r) => r.passed).length;
  const failedUrls = results.length - passedUrls;
  const scores = results.map((r) => r.score);
  const averageScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;
  const worstScore = scores.length > 0 ? Math.min(...scores) : 0;

  if (!silent) {
    printMultiSummary(passedUrls, failedUrls, averageScore);
  }

  return {
    passed: failedUrls === 0,
    totalUrls: results.length,
    passedUrls,
    failedUrls,
    averageScore,
    worstScore,
    results,
    device: config.device,
    timestamp: new Date().toISOString(),
  };
}
