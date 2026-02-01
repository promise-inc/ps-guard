const METRIC_HINTS: Record<string, string[]> = {
  LCP: [
    "Optimize or compress the largest image/video on the page",
    "Use <link rel=\"preload\"> for critical above-the-fold resources",
    "Reduce server response time (TTFB impacts LCP)",
    "Remove render-blocking JavaScript and CSS",
  ],
  CLS: [
    "Set explicit width/height on images and videos",
    "Avoid inserting content above existing content dynamically",
    "Use CSS contain-intrinsic-size for lazy-loaded content",
    "Prefer CSS transforms for animations instead of layout-triggering properties",
  ],
  INP: [
    "Break up long tasks (>50ms) into smaller chunks",
    "Use requestIdleCallback or Web Workers for heavy computation",
    "Minimize JavaScript execution on user interactions",
    "Reduce DOM size to speed up event handling",
  ],
  TTFB: [
    "Use a CDN to serve content closer to users",
    "Optimize server-side rendering or database queries",
    "Enable HTTP/2 or HTTP/3",
    "Implement edge caching or stale-while-revalidate",
  ],
  FCP: [
    "Eliminate render-blocking resources",
    "Inline critical CSS above the fold",
    "Reduce server response time",
    "Preconnect to required origins",
  ],
};

export function getHints(metricName: string): string[] {
  return METRIC_HINTS[metricName] ?? [];
}
