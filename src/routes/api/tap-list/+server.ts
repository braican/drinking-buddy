import { ApiResponse } from '#utils';

type TapBeer = {
  /** Untappd beer ID — the same ID as `beers.id` in the database. */
  untappdId: number | null;
  name: string;
  /** The menu tab the beer is listed under, e.g. "Main Bar Drafts". */
  bar: string | null;
  /** The section within the tab, e.g. "IPA", "Nitro", "Side Pull Drafts". */
  section: string | null;
  /** Untappd style, e.g. "IPA - Imperial". */
  style: string | null;
  abv: number | null;
  description: string | null;
};

// ---------------------------------------------------------------------------
// Untappd for Business embed
// ---------------------------------------------------------------------------
//
// Every Tree House draft list page embeds an Untappd for Business menu:
//
//   PreloadEmbedMenu("menu-container", <locationId>, <themeId>)
//
// which loads https://business.untappd.com/locations/<locationId>/themes/<themeId>/js.
// That script contains the full rendered menu — every tab — as a string assigned to
// `container.innerHTML`, so we can read it without running any JavaScript.

const EMBED_PATTERN = /PreloadEmbedMenu\(\s*["'][^"']*["']\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/;

async function fetchMenuHtml(draftListUrl: string): Promise<string> {
  const pageResponse = await fetch(draftListUrl);
  if (!pageResponse.ok) {
    throw new Error(`Could not fetch the draft list page (${pageResponse.status}).`);
  }

  const embedMatch = (await pageResponse.text()).match(EMBED_PATTERN);
  if (!embedMatch) {
    throw new Error('Could not find the Untappd menu embed on the draft list page.');
  }

  const [, locationId, themeId] = embedMatch;
  const embedResponse = await fetch(
    `https://business.untappd.com/locations/${locationId}/themes/${themeId}/js`,
  );
  if (!embedResponse.ok) {
    throw new Error(`Could not fetch the Untappd menu (${embedResponse.status}).`);
  }

  const script = await embedResponse.text();
  const htmlMatch = script.match(/container\.innerHTML\s*=\s*("(?:[^"\\]|\\.)*")/);
  if (!htmlMatch) {
    throw new Error('Could not find the menu markup in the Untappd embed.');
  }

  return decodeJsString(htmlMatch[1]);
}

/**
 * Decodes a double-quoted JS string literal. JSON handles most of it; escapes that are
 * legal in JS but not in JSON (like `\'`) are unescaped first.
 */
function decodeJsString(literal: string): string {
  const jsonSafe = literal.replace(/\\(.)/gs, (escape, char) =>
    '"\\/bfnrtu'.includes(char) ? escape : char,
  );
  return JSON.parse(jsonSafe);
}

function decodeEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function textOf(html: string | undefined): string | null {
  if (!html) return null;
  const text = decodeEntities(html.replace(/<[^>]*>/g, '')).trim();
  return text || null;
}

/**
 * Walks the menu markup: tabs (`.tab-content`) → sections (`.section`) → items (`.menu-item`).
 *
 * Locations use different Untappd themes (standard, compact, table) with slightly different
 * markup. Only the standard theme (Charlton, Tewksbury) links each beer to Untappd, giving
 * us its ID. In all of them, a beer is an item with an Untappd link or an ABV — cocktails,
 * coffee and soda have neither.
 */
function parseMenu(html: string): TapBeer[] {
  const beers: TapBeer[] = [];
  const seen = new Set<string>();

  for (const tab of html.split('<div class="tab-content"').slice(1)) {
    const bar = textOf(tab.match(/<h2 class="h2[^"]*">([\s\S]*?)<\/h2>/)?.[1]);

    for (const sectionHtml of tab.split(/<div class="(?:[^"]*\s)?section(?:\s[^"]*)?">/).slice(1)) {
      const section = textOf(sectionHtml.match(/<h3[^>]*>([\s\S]*?)<\/h3>/)?.[1]);

      for (const item of sectionHtml.split(/<div class="item-bg-color menu-item[\s"]/).slice(1)) {
        // In every theme, the item's name is the first element with an id.
        const name = textOf(item.match(/<span id="[^"]*">([\s\S]*?)<\/span>/)?.[1]);
        if (!name) continue;

        const link = item.match(/href="https:\/\/untappd\.com\/b\/[^"]*\/(\d+)"/);
        const abvMatch = item.match(/class="item-abv">\s*([\d.]+)%/);
        if (!link && !abvMatch) continue;

        const untappdId = link ? Number(link[1]) : null;
        const seenKey = `${bar}:${untappdId ?? name.toLowerCase()}`;
        if (seen.has(seenKey)) continue;
        seen.add(seenKey);

        beers.push({
          untappdId,
          name,
          bar,
          section,
          style: textOf(item.match(/class="item-category">([\s\S]*?)<\/span>/)?.[1]),
          abv: abvMatch ? parseFloat(abvMatch[1]) : null,
          description: textOf(item.match(/_description">([\s\S]*?)<\/p>/)?.[1]),
        });
      }
    }
  }

  return beers;
}

// ---------------------------------------------------------------------------
// Location registry
// ---------------------------------------------------------------------------

const LOCATIONS: Record<string, { name: string; url: string }> = {
  charlton: { name: 'Charlton', url: 'https://treehousebrew.com/draft-list' },
  tewksbury: { name: 'Tewksbury', url: 'https://treehousebrew.com/draft-list-tewksbury' },
  prudential: {
    name: 'Prudential Center (Boston)',
    url: 'https://treehousebrew.com/draft-list-prudential',
  },
  sandwich: { name: 'Sandwich (Cape Cod)', url: 'https://treehousebrew.com/draft-list-sandwich' },
  deerfield: { name: 'Deerfield', url: 'https://treehousebrew.com/draft-list-deerfield' },
  saratoga: { name: 'Saratoga', url: 'https://treehousebrew.com/draft-list-saratoga' },
  woodstock: { name: 'Woodstock (CT)', url: 'https://treehousebrew.com/draft-list-woodstock' },
};

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
  const location = url.searchParams.get('location');

  if (!location || !LOCATIONS[location]) {
    return ApiResponse.error('Invalid location.', 400);
  }

  const { name: locationName, url: draftListUrl } = LOCATIONS[location];

  try {
    const beers = parseMenu(await fetchMenuHtml(draftListUrl));

    if (beers.length === 0) {
      console.error('[Tap list] Parser found no beers for', location);
      return ApiResponse.error('No beers found in the draft list.', 500);
    }

    return ApiResponse.success({ beers, location: locationName });
  } catch (error) {
    console.error('[Error fetching tap list]', error);
    return ApiResponse.error(error.message, 500);
  }
}
