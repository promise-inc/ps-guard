import { loadConfig as _loadConfig } from "./config";
import { runLighthouse as _runLighthouse } from "./runner";
import { validateResults as _validateResults } from "./validator";
import type { PSGuardConfig, PSGuardResult } from "./types";

export { loadConfig, resolvePreset } from "./config";
export { runLighthouse } from "./runner";
export { parseMetrics } from "./parser";
export { validateResults } from "./validator";
export { reportHuman, reportJSON } from "./reporter";
export { getHints } from "./hints";
export { presets, presetNames } from "./presets";

export type {
  PSGuardConfig,
  PSGuardThresholds,
  MetricResult,
  PSGuardResult,
  Preset,
} from "./types";

export async function runPSGuard(
  url: string,
  options: Partial<Omit<PSGuardConfig, "url">> = {}
): Promise<PSGuardResult> {
  const config = _loadConfig(process.cwd(), { url, ...options });
  const lighthouseResult = await _runLighthouse(config);
  return _validateResults(lighthouseResult.lhr, config);
}
