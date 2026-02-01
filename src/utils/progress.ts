import { setCIMode } from "./output";

let ciMode = false;

export function setProgressCIMode(enabled: boolean): void {
  ciMode = enabled;
  setCIMode(enabled);
}

function color(code: string, text: string): string {
  if (ciMode) return text;
  return `\x1b[${code}m${text}\x1b[0m`;
}

export function printScanStart(totalUrls: number): void {
  console.log();
  console.log(color("1;36", `Scanning ${totalUrls} URLs from sitemap...`));
  console.log();
}

export function printUrlResult(
  index: number,
  total: number,
  score: number,
  url: string,
  passed: boolean
): void {
  const counter = `[${index}/${total}]`;
  const icon = passed ? color("32", "\u2714") : color("31", "\u2716");
  const scoreStr = passed ? color("32", String(score)) : color("31", String(score));
  console.log(`${counter} ${icon} ${scoreStr}  ${url}`);
}

export function printUrlError(
  index: number,
  total: number,
  url: string,
  errorMessage: string
): void {
  const counter = `[${index}/${total}]`;
  const icon = color("31", "\u2716");
  console.log(`${counter} ${icon} ${color("31", "ERR")}  ${url}`);
  console.log(`       ${color("2", errorMessage)}`);
}

export function printMultiSummary(
  passedUrls: number,
  failedUrls: number,
  averageScore: number
): void {
  console.log();
  const total = passedUrls + failedUrls;
  if (failedUrls === 0) {
    console.log(color("1;32", `\u2714 All ${total} URLs passed (avg score: ${averageScore})`));
  } else {
    console.log(color("1;31", `\u2716 ${failedUrls} of ${total} URLs failed (avg score: ${averageScore})`));
  }
  console.log();
}
