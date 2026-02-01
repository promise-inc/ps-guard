import * as fs from "node:fs";
import * as path from "node:path";
import type { PSGuardResult, PSGuardMultiResult, MetricResult } from "./types";

function scoreColor(score: number): string {
  if (score >= 90) return "#0cce6b";
  if (score >= 50) return "#ffa400";
  return "#ff4e42";
}

function metricColor(metric: MetricResult): string {
  return metric.passed ? "#0cce6b" : "#ff4e42";
}

function barWidth(value: number, limit: number): number {
  const ratio = Math.min(value / (limit * 1.5), 1);
  return Math.round(ratio * 100);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderMetricRow(metric: MetricResult): string {
  const color = metricColor(metric);
  const width = barWidth(metric.value, metric.limit);
  const displayValue = metric.unit
    ? `${metric.value}${metric.unit}`
    : String(metric.value);

  return `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:500;">${escapeHtml(metric.name)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="flex:1;background:#f3f4f6;border-radius:4px;height:20px;overflow:hidden;">
            <div style="width:${width}%;height:100%;background:${color};border-radius:4px;transition:width 0.3s;"></div>
          </div>
          <span style="color:${color};font-weight:600;min-width:70px;text-align:right;">${escapeHtml(displayValue)}</span>
        </div>
      </td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;">${metric.limit}${metric.unit}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">
        <span style="color:${color};font-size:18px;">${metric.passed ? "\u2714" : "\u2716"}</span>
      </td>
    </tr>`;
}

function renderUrlDetail(result: PSGuardResult, index: number): string {
  const color = scoreColor(result.score);
  const metricsRows = result.metrics.map(renderMetricRow).join("");

  return `
    <div style="margin-bottom:16px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
      <div onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'block':'none';this.querySelector('.arrow').textContent=this.nextElementSibling.style.display==='none'?'\u25B6':'\u25BC'"
           style="padding:12px 16px;background:#f9fafb;cursor:pointer;display:flex;align-items:center;justify-content:space-between;user-select:none;">
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="color:${color};font-size:18px;">${result.passed ? "\u2714" : "\u2716"}</span>
          <span style="font-weight:500;">#${index + 1}</span>
          <a href="${escapeHtml(result.url)}" target="_blank" rel="noopener" style="color:#2563eb;text-decoration:none;word-break:break-all;">${escapeHtml(result.url)}</a>
        </div>
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="background:${color};color:#fff;padding:2px 10px;border-radius:12px;font-weight:700;font-size:14px;">${result.score}</span>
          <span class="arrow" style="color:#6b7280;">\u25B6</span>
        </div>
      </div>
      <div style="display:none;padding:16px;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="text-align:left;">
              <th style="padding:8px 12px;border-bottom:2px solid #e5e7eb;color:#6b7280;font-weight:600;width:80px;">Metric</th>
              <th style="padding:8px 12px;border-bottom:2px solid #e5e7eb;color:#6b7280;font-weight:600;">Value</th>
              <th style="padding:8px 12px;border-bottom:2px solid #e5e7eb;color:#6b7280;font-weight:600;width:80px;">Limit</th>
              <th style="padding:8px 12px;border-bottom:2px solid #e5e7eb;color:#6b7280;font-weight:600;width:60px;text-align:center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${metricsRows}
          </tbody>
        </table>
      </div>
    </div>`;
}

function renderSummaryCard(label: string, value: string | number, color: string): string {
  return `
    <div style="flex:1;min-width:140px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;text-align:center;">
      <div style="font-size:28px;font-weight:700;color:${color};">${value}</div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px;">${escapeHtml(label)}</div>
    </div>`;
}

function wrapSingleResult(result: PSGuardResult): PSGuardMultiResult {
  return {
    passed: result.passed,
    totalUrls: 1,
    passedUrls: result.passed ? 1 : 0,
    failedUrls: result.passed ? 0 : 1,
    averageScore: result.score,
    worstScore: result.score,
    results: [result],
    device: result.device,
    timestamp: new Date().toISOString(),
  };
}

export function generateHtmlReport(input: PSGuardResult | PSGuardMultiResult): string {
  const multi = "totalUrls" in input ? input : wrapSingleResult(input);

  const avgColor = scoreColor(multi.averageScore);
  const worstColor = scoreColor(multi.worstScore);
  const passedColor = multi.failedUrls === 0 ? "#0cce6b" : "#ff4e42";

  const urlDetails = multi.results
    .map((result, index) => renderUrlDetail(result, index))
    .join("");

  const urlRows = multi.results
    .map((result, index) => {
      const color = scoreColor(result.score);
      return `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${index + 1}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">
            <a href="${escapeHtml(result.url)}" target="_blank" rel="noopener" style="color:#2563eb;text-decoration:none;word-break:break-all;">${escapeHtml(result.url)}</a>
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">
            <span style="background:${color};color:#fff;padding:2px 10px;border-radius:12px;font-weight:700;font-size:13px;">${result.score}</span>
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">
            <span style="color:${color};font-size:16px;">${result.passed ? "\u2714" : "\u2716"}</span>
          </td>
        </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ps-guard Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6; color: #1f2937; line-height: 1.5; }
    .container { max-width: 960px; margin: 0 auto; padding: 24px 16px; }
    h1 { font-size: 24px; margin-bottom: 4px; }
    h2 { font-size: 18px; margin: 24px 0 12px; color: #374151; }
    .subtitle { color: #6b7280; font-size: 14px; margin-bottom: 20px; }
    .cards { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:8px;">
      <h1>ps-guard Report</h1>
      <span class="badge" style="background:${passedColor};color:#fff;font-size:14px;padding:4px 12px;">
        ${multi.passed ? "PASSED" : "FAILED"}
      </span>
    </div>
    <p class="subtitle">
      ${escapeHtml(multi.device)} &middot; ${multi.totalUrls} URL${multi.totalUrls > 1 ? "s" : ""} &middot; ${escapeHtml(multi.timestamp)}
    </p>

    <div class="cards">
      ${renderSummaryCard("Avg Score", multi.averageScore, avgColor)}
      ${renderSummaryCard("Worst Score", multi.worstScore, worstColor)}
      ${renderSummaryCard("Passed", `${multi.passedUrls}/${multi.totalUrls}`, passedColor)}
      ${renderSummaryCard("Failed", multi.failedUrls, multi.failedUrls > 0 ? "#ff4e42" : "#0cce6b")}
    </div>

    <h2>URL Overview</h2>
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow-x:auto;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="text-align:left;">
            <th style="padding:8px 12px;border-bottom:2px solid #e5e7eb;color:#6b7280;font-weight:600;width:40px;">#</th>
            <th style="padding:8px 12px;border-bottom:2px solid #e5e7eb;color:#6b7280;font-weight:600;">URL</th>
            <th style="padding:8px 12px;border-bottom:2px solid #e5e7eb;color:#6b7280;font-weight:600;width:80px;text-align:center;">Score</th>
            <th style="padding:8px 12px;border-bottom:2px solid #e5e7eb;color:#6b7280;font-weight:600;width:60px;text-align:center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${urlRows}
        </tbody>
      </table>
    </div>

    <h2>Details</h2>
    ${urlDetails}

    <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:32px;">
      Generated by ps-guard &middot; ${escapeHtml(new Date().toISOString())}
    </p>
  </div>
</body>
</html>`;
}

export function writeHtmlReport(
  input: PSGuardResult | PSGuardMultiResult,
  outputDir: string
): string {
  const html = generateHtmlReport(input);
  const dir = path.resolve(outputDir);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(dir, "index.html");
  fs.writeFileSync(filePath, html, "utf-8");
  return filePath;
}
