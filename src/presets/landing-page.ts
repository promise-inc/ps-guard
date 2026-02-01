import type { Preset } from "../types";

export const landingPage: Preset = {
  device: "mobile",
  thresholds: {
    lcp: 1800,
    cls: 0.05,
    inp: 100,
    ttfb: 500,
    fcp: 1200,
  },
};
