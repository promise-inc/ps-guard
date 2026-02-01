import type { SitemapEntry } from "./types";

const FETCH_TIMEOUT_MS = 10_000;
const MAX_DEPTH = 2;

function extractLocs(xml: string): string[] {
  const matches: string[] = [];
  const regex = /<loc>\s*(.*?)\s*<\/loc>/gi;
  let match = regex.exec(xml);
  while (match !== null) {
    matches.push(match[1]);
    match = regex.exec(xml);
  }
  return matches;
}

function isSitemapIndex(xml: string): boolean {
  return /<sitemapindex[\s>]/i.test(xml);
}

async function fetchXml(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap: ${response.status} ${response.statusText}`);
    }
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function parseSitemap(url: string, depth: number): Promise<string[]> {
  const xml = await fetchXml(url);
  const locs = extractLocs(xml);

  if (isSitemapIndex(xml) && depth < MAX_DEPTH) {
    const nested = await Promise.all(
      locs.map((loc) => parseSitemap(loc, depth + 1))
    );
    return nested.flat();
  }

  return locs;
}

export async function fetchSitemap(url: string): Promise<SitemapEntry[]> {
  const urls = await parseSitemap(url, 0);
  const unique = [...new Set(urls)];
  return unique.map((u) => ({ url: u }));
}
