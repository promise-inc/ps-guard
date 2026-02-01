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
}
