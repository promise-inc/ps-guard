import type { Preset } from "../types";
import { nextjs } from "./nextjs";
import { landingPage } from "./landing-page";
import { marketingSite } from "./marketing-site";

export const presets: Record<string, Preset> = {
  nextjs,
  "landing-page": landingPage,
  "marketing-site": marketingSite,
};

export const presetNames = Object.keys(presets);
