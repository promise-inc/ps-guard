import type { Preset } from "../types";

export const marketingSite: Preset = {
  device: "mobile",
  thresholds: {
    lcp: 2500,
    cls: 0.1,
    inp: 200,
    ttfb: 800,
    fcp: 1800,
  },
};
