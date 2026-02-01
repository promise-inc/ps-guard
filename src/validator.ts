import type { MetricResult, PSGuardConfig, PSGuardResult } from "./types";
import { parseMetrics } from "./parser";

interface LighthouseLHR {
  categories: {
    performance?: { score: number | null };
  };
  audits: Record<string, { numericValue?: number }>;
}

export function validateResults(
  lhr: LighthouseLHR,
  config: PSGuardConfig
): PSGuardResult {
  const rawScore = lhr.categories.performance?.score ?? 0;
  const score = Math.round(rawScore * 100);

  const metrics: MetricResult[] = parseMetrics(lhr.audits, config.thresholds);

  const scorePassed = score >= config.minScore;
  const allMetricsPassed = metrics.every((m) => m.passed);

  return {
    passed: scorePassed && allMetricsPassed,
    score,
    minScore: config.minScore,
    metrics,
    url: config.url,
    device: config.device,
  };
}
