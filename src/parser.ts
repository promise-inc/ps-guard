import type { MetricResult, PSGuardThresholds } from "./types";

interface LighthouseAudits {
  [key: string]: { numericValue?: number };
}

const METRIC_MAP: Record<keyof PSGuardThresholds, { audit: string; unit: string }> = {
  lcp: { audit: "largest-contentful-paint", unit: "ms" },
  cls: { audit: "cumulative-layout-shift", unit: "" },
  inp: { audit: "experimental-interaction-to-next-paint", unit: "ms" },
  ttfb: { audit: "server-response-time", unit: "ms" },
  fcp: { audit: "first-contentful-paint", unit: "ms" },
};

export function parseMetrics(
  audits: LighthouseAudits,
  thresholds: PSGuardThresholds
): MetricResult[] {
  const results: MetricResult[] = [];

  for (const [key, mapping] of Object.entries(METRIC_MAP)) {
    const thresholdKey = key as keyof PSGuardThresholds;
    const limit = thresholds[thresholdKey];

    if (limit === undefined) continue;

    const audit = audits[mapping.audit];
    const rawValue = audit?.numericValue ?? 0;

    const value = key === "cls"
      ? Math.round(rawValue * 1000) / 1000
      : Math.round(rawValue);

    results.push({
      name: key.toUpperCase(),
      value,
      limit,
      passed: value <= limit,
      unit: mapping.unit,
    });
  }

  return results;
}
