import type { UrlItem } from "@/lib/model";

export function splitNonEmptyLines(input: string): string[] {
  return input
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function parseTags(input: string): string[] {
  if (!input.trim()) return [];
  return input
    .split(/[,\n]/g)
    .map((t) => t.trim())
    .filter(Boolean);
}

// Each line: "label | https://example.com" OR just "https://example.com"
export function parseUrlList(input: string): UrlItem[] {
  const lines = splitNonEmptyLines(input);
  const items: UrlItem[] = [];
  for (const line of lines) {
    const parts = line.split("|").map((p) => p.trim());
    if (parts.length === 1) {
      items.push({ url: parts[0] });
      continue;
    }
    const url = parts.at(-1);
    const label = parts.slice(0, -1).join(" | ").trim();
    if (!url) continue;
    items.push({ label: label || undefined, url });
  }
  return items;
}

export function urlListToText(items: UrlItem[] | undefined): string {
  if (!items?.length) return "";
  return items
    .map((item) => (item.label ? `${item.label} | ${item.url}` : item.url))
    .join("\n");
}

