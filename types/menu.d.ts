import type { BeerWithData } from './beer';

// Shape of a menu scan, as returned by /api/menu/analyze.

export type MenuItemStatus = 'available' | 'sold_out' | 'coming_soon';
export type MenuItemConfidence = 'high' | 'medium' | 'low';

export interface MenuItem {
  /** The drink's own name, exactly as printed. Excludes brewery, style, ABV and price. */
  name: string;
  /** Brewery credited on the menu, or null when the menu doesn't name one. */
  brewery: string | null;
  /** Heading the item appeared under, e.g. "Drafts", "Cans To Go". */
  section: string | null;
  status: MenuItemStatus;
  /** How legible this particular item was. Useful for triaging bad scans. */
  confidence: MenuItemConfidence;
}

export interface MenuScanUsage {
  inputTokens: number;
  outputTokens: number;
  cacheWriteTokens: number;
  cacheReadTokens: number;
  /** Estimated list cost in USD for this scan. */
  usd: number | null;
}

export interface MenuScanResult {
  items: MenuItem[];
  /** The house brewery, when the photo is clearly one brewery's own list. */
  menuBrewery: string | null;
  usage: MenuScanUsage;
}

/** One menu item paired with the beer it resolved to, if any. */
export interface MenuMatch {
  item: MenuItem;
  /** The beer from your history, or null when you haven't had it. */
  beer: BeerWithData | null;
  /** Match confidence in 0..1. 1 means the normalized names were identical. */
  score: number;
}
