import type { PSGuardResult, PSGuardMultiResult } from "./types";
import { getHints } from "./hints";
import {
  printHeader,
  printScoreRow,
  printMetricRow,
  printHint,
  printSummary,
} from "./utils/output";

export function reportHuman(result: PSGuardResult): void {
  printHeader(result.url, result.device);
  printScoreRow(result.score, result.minScore);
  console.log();

  for (const metric of result.metrics) {
    printMetricRow(metric);

    if (!metric.passed) {
      const hints = getHints(metric.name);
      for (const hint of hints) {
        printHint(hint);
      }
    }
  }

  const failedCount =
    result.metrics.filter((m) => !m.passed).length +
    (result.score < result.minScore ? 1 : 0);
  const totalCount = result.metrics.length + 1;

  printSummary(result.passed, failedCount, totalCount);
}

export function reportJSON(result: PSGuardResult): void {
  console.log(JSON.stringify(result, null, 2));
}

export function reportMultiHuman(multi: PSGuardMultiResult): void {
  for (const result of multi.results) {
    reportHuman(result);
  }
}

export function reportMultiJSON(multi: PSGuardMultiResult): void {
  console.log(JSON.stringify(multi, null, 2));
}
