export interface PSGuardThresholds {
  lcp?: number;
  cls?: number;
  inp?: number;
  ttfb?: number;
  fcp?: number;
}

export interface PSGuardConfig {
  url: string;
  device: "mobile" | "desktop";
  minScore: number;
  thresholds: PSGuardThresholds;
  failOnError: boolean;
  retries: number;
  preset?: string;
  sitemap?: string;
  report?: string;
  html?: boolean;
  maxUrls?: number;
}

export interface MetricResult {
  name: string;
  value: number;
  limit: number;
  passed: boolean;
  unit: string;
}

export interface PSGuardResult {
  passed: boolean;
  score: number;
  minScore: number;
  metrics: MetricResult[];
  url: string;
  device: "mobile" | "desktop";
}

export interface Preset {
  device: "mobile" | "desktop";
  thresholds: PSGuardThresholds;
  lighthouseFlags?: Record<string, unknown>;
}

export interface CLIArgs {
  url?: string;
  preset?: string;
  device?: "mobile" | "desktop";
  json: boolean;
  ci: boolean;
  help: boolean;
  retries?: number;
  sitemap?: string;
  report?: string;
  html: boolean;
  maxUrls?: number;
}

export interface SitemapEntry {
  url: string;
}

export interface PSGuardMultiResult {
  passed: boolean;
  totalUrls: number;
  passedUrls: number;
  failedUrls: number;
  averageScore: number;
  worstScore: number;
  results: PSGuardResult[];
  device: "mobile" | "desktop";
  timestamp: string;
}
