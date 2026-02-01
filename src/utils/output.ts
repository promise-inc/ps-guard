import type { MetricResult } from "../types";

const COLORS = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  reset: "\x1b[0m",
};

let ciMode = false;

export function setCIMode(enabled: boolean): void {
  ciMode = enabled;
}

function c(color: keyof typeof COLORS, text: string): string {
  if (ciMode) return text;
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

function bc(color: keyof typeof COLORS, text: string): string {
  if (ciMode) return text;
  return `${COLORS.bold}${COLORS[color]}${text}${COLORS.reset}`;
}

export function printHeader(url: string, device: string): void {
  console.log();
  console.log(bc("cyan", "ps-guard"));
  console.log();
  console.log(`  URL:    ${c("cyan", url)}`);
  console.log(`  Device: ${c("cyan", device)}`);
  console.log();
}

export function printScoreRow(score: number, minScore: number): void {
  const passed = score >= minScore;
  const icon = passed ? c("green", "✔") : c("red", "✖");
  const label = passed ? c("green", String(score)) : c("red", String(score));
  console.log(`  ${icon} Performance Score: ${label} ${c("dim", `(min: ${minScore})`)}`);
}

export function printMetricRow(metric: MetricResult): void {
  const icon = metric.passed ? c("green", "✔") : c("red", "✖");
  const valueStr = metric.passed
    ? c("green", `${metric.value}${metric.unit}`)
    : c("red", `${metric.value}${metric.unit}`);
  const limitStr = c("dim", `(max: ${metric.limit}${metric.unit})`);
  const padding = " ".repeat(Math.max(0, 6 - metric.name.length));
  console.log(`  ${icon} ${metric.name}${padding} ${valueStr} ${limitStr}`);
}

export function printHint(hint: string): void {
  console.log(`    ${c("yellow", "→")} ${c("dim", hint)}`);
}

export function printSummary(passed: boolean, failedCount: number, totalCount: number): void {
  console.log();
  if (passed) {
    console.log(`  ${bc("green", "✔ All checks passed")}`);
  } else {
    console.log(
      `  ${bc("red", `✖ ${failedCount} of ${totalCount} checks failed`)}`
    );
  }
  console.log();
}

export function printError(message: string): void {
  console.error(`\n  ${c("red", `✖ ${message}`)}\n`);
}
