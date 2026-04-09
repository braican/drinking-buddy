import { ApiResponse } from '@utils';

type TapBeer = {
  name: string;
  bar: string | null;
  style: string | null;
  abv: number | null;
  description: string | null;
};

const LOCATIONS: Record<string, { name: string; url: string }> = {
  charlton: {
    name: 'Charlton',
    url: 'https://treehousebrew.com/draft-list',
  },
  tewksbury: {
    name: 'Tewksbury',
    url: 'https://treehousebrew.com/draft-list-tewksbury',
  },
  prudential: {
    name: 'Prudential Center (Boston)',
    url: 'https://treehousebrew.com/draft-list-prudential',
  },
  sandwich: {
    name: 'Sandwich (Cape Cod)',
    url: 'https://treehousebrew.com/draft-list-sandwich',
  },
  deerfield: {
    name: 'Deerfield',
    url: 'https://treehousebrew.com/draft-list-deerfield',
  },
  saratoga: {
    name: 'Saratoga',
    url: 'https://treehousebrew.com/draft-list-saratoga',
  },
  woodstock: {
    name: 'Woodstock (CT)',
    url: 'https://treehousebrew.com/draft-list-woodstock',
  },
};

/**
 * Parse the Jina-rendered markdown from treehousebrew.com.
 *
 * Two-pass approach:
 *   Pass 1 — build a lookup of fully-described beers (those with a #### heading, style, ABV, description).
 *   Pass 2 — walk lines in order to preserve visual sequence. Beer label images use the linked format
 *             [![Image N: Name](img)](untappd-url), while cocktail images are plain ![...] (not linked),
 *             so cocktails are naturally excluded. Beers that only have a label image (no #### entry yet)
 *             get the current ### section name as their style fallback.
 */
function parseTapList(markdown: string): TapBeer[] {
  // Pass 1: collect full entry data keyed by lowercase name
  type FullEntry = { style: string | null; abv: number; description: string | null };
  const fullEntries = new Map<string, FullEntry>();

  for (const chunk of markdown.split('#### ').slice(1)) {
    const headerMatch = chunk.match(/^\[([^\]]+)\]\([^)]*\)([^\n]*)/);
    if (!headerMatch) continue;

    const name = headerMatch[1].trim();
    const style = headerMatch[2].trim() || null;

    const abvMatch = chunk.match(/([\d.]+)% ABV/);
    if (!abvMatch) continue;

    const abv = parseFloat(abvMatch[1]);

    let description: string | null = null;
    const descMatch = chunk.match(/\[More Info[^\n]*\]\([^)]*\)\n\n([\s\S]*?)\n\n\[Less Info/);
    if (descMatch) description = descMatch[1].trim();

    fullEntries.set(name.toLowerCase(), { style, abv, description });
  }

  // Pass 2: walk lines in order to preserve the visual tap list sequence
  const beers: TapBeer[] = [];
  const seen = new Set<string>();
  let currentBar: string | null = null;
  let currentSection: string | null = null;

  for (const line of markdown.split('\n')) {
    // ## headers are the bar/tab names (e.g. "Main Bar Drafts", "Classics Bar Drafts")
    const barMatch = line.match(/^## (.+)/);
    if (barMatch) {
      currentBar = barMatch[1].trim();
      continue;
    }

    // ### headers are style categories within each bar
    const sectionMatch = line.match(/^### (.+)/);
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim();
      continue;
    }

    // Beer label images are linked: [![Image N: Name](img)](untappd-url)
    // Cocktail images are plain: ![Image N: Name](img) — won't match \[!\[
    const imageMatch = line.match(/^\[!\[Image \d+: ([^\]]+)\]/);
    if (!imageMatch) continue;

    const name = imageMatch[1].trim();
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const full = fullEntries.get(key);
    if (full) {
      beers.push({ name, bar: currentBar, style: full.style, abv: full.abv, description: full.description });
    } else {
      // No #### entry found — new/limited beer with only a label image on the page
      beers.push({ name, bar: currentBar, style: currentSection, abv: null, description: null });
    }
  }

  return beers;
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
  const location = url.searchParams.get('location');

  if (!location || !LOCATIONS[location]) {
    return ApiResponse.error('Invalid location.', 400);
  }

  const { name: locationName, url: draftListUrl } = LOCATIONS[location];

  try {
    const jinaResponse = await fetch(`https://r.jina.ai/${draftListUrl}`, {
      headers: { Accept: 'text/plain' },
    });

    if (!jinaResponse.ok) {
      return ApiResponse.error(
        `Could not fetch the draft list page (${jinaResponse.status}).`,
        500,
      );
    }

    const markdown = await jinaResponse.text();
    const beers = parseTapList(markdown);

    if (beers.length === 0) {
      console.error('[Tap list] Parser found no beers. First 500 chars:', markdown.slice(0, 500));
      return ApiResponse.error('No beers found in the draft list.', 500);
    }

    return ApiResponse.success({ beers, location: locationName });
  } catch (error) {
    console.error('[Error fetching tap list]', error);
    return ApiResponse.error(error.message, 500);
  }
}
