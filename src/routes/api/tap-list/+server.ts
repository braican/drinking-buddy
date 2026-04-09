import { ApiResponse } from '@utils';

type TapBeer = {
  name: string;
  bar: string | null;
  style: string | null;
  abv: number | null;
  description: string | null;
};

// Known Untappd primary style categories, ordered so multi-word names match before single words
// (e.g. "Pale Ale" must be checked before "Ale")
const PRIMARY_STYLES = [
  'Pale Ale',
  'Brown Ale',
  'Farmhouse Ale',
  'Barleywine-Style Ale',
  'Wheat Beer',
  'Sour Ale',
  'Session Ale',
  'Golden Ale',
  'Session IPA',
  'IPA',
  'Stout',
  'Ale',
  'Lager',
  'Pilsner',
  'Porter',
  'Cider',
  'Saison',
  'Bock',
  'Wheat',
  'Sour',
  'Barleywine',
  'Lambic',
  'Gose',
  'Mead',
  'Kölsch',
  'Kolsch',
];

// ---------------------------------------------------------------------------
// Charlton — linked beer label images + #### [Name](url)Style headings
// ---------------------------------------------------------------------------

/**
 * Two-pass approach:
 *   Pass 1 — build a lookup of fully-described beers (#### heading, style, ABV, description).
 *   Pass 2 — walk linked image lines in visual order; plain ![...] cocktail images are excluded.
 */
function parseTapListCharlton(markdown: string): TapBeer[] {
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

  const beers: TapBeer[] = [];
  const seen = new Set<string>();
  let currentBar: string | null = null;
  let currentSection: string | null = null;

  for (const line of markdown.split('\n')) {
    const barMatch = line.match(/^## (.+)/);
    if (barMatch) {
      currentBar = barMatch[1].trim();
      continue;
    }

    const sectionMatch = line.match(/^### (.+)/);
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim();
      continue;
    }

    const imageMatch = line.match(/^\[!\[Image \d+: ([^\]]+)\]/);
    if (!imageMatch) continue;

    const name = imageMatch[1].trim();
    const nameKey = name.toLowerCase();
    const seenKey = `${currentBar}:${nameKey}`;
    if (seen.has(seenKey)) continue;
    seen.add(seenKey);

    const full = fullEntries.get(nameKey);
    if (full) {
      beers.push({
        name,
        bar: currentBar,
        style: full.style,
        abv: full.abv,
        description: full.description,
      });
    } else {
      beers.push({ name, bar: currentBar, style: currentSection, abv: null, description: null });
    }
  }

  return beers;
}

// ---------------------------------------------------------------------------
// Deerfield — plain-text #### headings, "Style X% ABV" on the following line
// ---------------------------------------------------------------------------

function parseTapListDeerfield(markdown: string): TapBeer[] {
  const beers: TapBeer[] = [];
  const seen = new Set<string>();
  let currentBar: string | null = null;
  let currentSection: string | null = null;

  const lines = markdown.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const barMatch = line.match(/^## (.+)/);
    if (barMatch) {
      currentBar = barMatch[1].trim();
      continue;
    }

    // Strip optional price suffix (e.g. "IPA $9" → "IPA")
    const sectionMatch = line.match(/^### (.+)/);
    if (sectionMatch) {
      currentSection = sectionMatch[1].replace(/\s+\$[\d.]+$/, '').trim();
      continue;
    }

    const beerMatch = line.match(/^#### (.+)/);
    if (!beerMatch) continue;

    const nameRaw = beerMatch[1].trim();
    // Linked names belong to the Charlton format — skip if encountered
    if (nameRaw.startsWith('[')) continue;

    const name = nameRaw;
    const seenKey = `${currentBar ?? '_'}:${name.toLowerCase()}`;
    if (seen.has(seenKey)) continue;
    seen.add(seenKey);

    // The line after the heading has "Style X% ABV" — use the ### heading as style, only extract ABV
    const style: string | null = currentSection;
    let abv: number | null = null;
    let j = i + 1;
    while (j < lines.length && lines[j].trim() === '') j++;
    if (j < lines.length) {
      const abvMatch = lines[j].match(/([\d.]+)%\s*ABV/);
      if (abvMatch) abv = parseFloat(abvMatch[1]);
    }

    let description: string | null = null;
    const remainingChunk = lines.slice(i).join('\n');
    const nextBeerIdx = remainingChunk.indexOf('\n#### ', 1);
    const relevantChunk = nextBeerIdx > -1 ? remainingChunk.slice(0, nextBeerIdx) : remainingChunk;
    const descMatch = relevantChunk.match(
      /\[More Info[^\n]*\]\([^)]*\)\n\n([\s\S]*?)\n\n\[Less Info/,
    );
    if (descMatch) description = descMatch[1].trim();

    beers.push({ name, bar: currentBar, style, abv, description });
  }

  return beers;
}

// ---------------------------------------------------------------------------
// Sandwich / Woodstock / Prudential — table format, inline "Name Style ABV%"
// ---------------------------------------------------------------------------

/**
 * These pages use an Untappd table embed. Each beer appears as a plain-text line:
 *   "Beer Name Style - Subcategory X.X%[optional serving info on same line]"
 * There are no #### headings or linked images.
 */
function parseTapListTableInline(markdown: string): TapBeer[] {
  const beers: TapBeer[] = [];
  const seen = new Set<string>();
  let currentBar: string | null = null;
  let inDescription = false;

  const lines = markdown.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track description blocks so their content is never parsed as beer lines.
    // [More Info ▸] and [Less Info ▴] both start with '[', so check them before
    // the generic link-skip below.
    if (line.startsWith('[More Info')) {
      inDescription = true;
      continue;
    }
    if (line.startsWith('[Less Info')) {
      inDescription = false;
      continue;
    }
    if (inDescription) continue;

    const barMatch = line.match(/^## (.+)/);
    if (barMatch) {
      currentBar = barMatch[1].trim();
      continue;
    }

    // Skip section headers (pour sizes, cocktail sections, etc.)
    if (line.match(/^### /)) continue;

    // Skip table structure, links, images, and non-content lines
    if (
      line.startsWith('|') ||
      !line.trim() ||
      line.startsWith('[') ||
      line.startsWith('!') ||
      line.startsWith('Displaying')
    )
      continue;

    // Beer lines must have an ABV percentage
    const abvMatch = line.match(/([\d.]+)%/);
    if (!abvMatch || abvMatch.index === undefined) continue;

    const abv = parseFloat(abvMatch[1]);
    // Everything before the ABV is "Name [PrimaryStyle][ - Subcategory]"
    const beforeAbv = line.slice(0, abvMatch.index).trim();
    if (!beforeAbv) continue;

    const { name, style } = splitNameAndStyle(beforeAbv);
    if (!name) continue;

    const seenKey = `${currentBar ?? '_'}:${name.toLowerCase()}`;
    if (seen.has(seenKey)) continue;
    seen.add(seenKey);

    // Find the boundary of this beer's block (next beer line or section header),
    // skipping over description block content so it can't trigger a false boundary.
    let boundary = lines.length;
    let inDesc = false;
    for (let j = i + 1; j < lines.length; j++) {
      const l = lines[j];
      if (l.startsWith('[More Info')) { inDesc = true; continue; }
      if (l.startsWith('[Less Info')) { inDesc = false; continue; }
      if (inDesc) continue;
      if (l.match(/^##/)) {
        boundary = j;
        break;
      }
      const nextAbv = l.match(/([\d.]+)%/);
      if (nextAbv && l.includes(' - ')) {
        boundary = j;
        break;
      }
    }

    let description: string | null = null;
    const relevantChunk = lines.slice(i, boundary).join('\n');
    const descMatch = relevantChunk.match(
      /\[More Info[^\n]*\]\([^)]*\)\n\n([\s\S]*?)\n\n\[Less Info/,
    );
    if (descMatch) description = descMatch[1].trim();

    beers.push({ name, bar: currentBar, style, abv, description });
  }

  return beers;
}

/**
 * Given the text before the ABV on a beer line (e.g. "Julius IPA - New England"),
 * split into the beer name and its style string.
 */
function splitNameAndStyle(beforeAbv: string): { name: string; style: string | null } {
  const dashIdx = beforeAbv.lastIndexOf(' - ');

  const nameAndPrimary = dashIdx !== -1 ? beforeAbv.slice(0, dashIdx).trim() : beforeAbv;
  const subcategory = dashIdx !== -1 ? beforeAbv.slice(dashIdx + 3).trim() : null;

  for (const ps of PRIMARY_STYLES) {
    if (nameAndPrimary === ps || nameAndPrimary.endsWith(` ${ps}`)) {
      const name = nameAndPrimary === ps ? ps : nameAndPrimary.slice(0, -(ps.length + 1)).trim();
      const style = subcategory ? `${ps} - ${subcategory}` : ps;
      return { name, style };
    }
  }

  // Primary style not recognised — use nameAndPrimary as name, subcategory as style
  return { name: nameAndPrimary, style: subcategory };
}

// ---------------------------------------------------------------------------
// Unsupported — JS-rendered pages that Jina cannot scrape
// ---------------------------------------------------------------------------

function parseTapListUnavailable(): TapBeer[] {
  return [];
}

// ---------------------------------------------------------------------------
// Location registry
// ---------------------------------------------------------------------------

const LOCATIONS: Record<string, { name: string; url: string; parse: (md: string) => TapBeer[] }> = {
  charlton: {
    name: 'Charlton',
    url: 'https://treehousebrew.com/draft-list',
    parse: parseTapListCharlton,
  },
  tewksbury: {
    name: 'Tewksbury',
    url: 'https://treehousebrew.com/draft-list-tewksbury',
    parse: parseTapListUnavailable, // JS-rendered; Jina cannot fetch this content
  },
  prudential: {
    name: 'Prudential Center (Boston)',
    url: 'https://treehousebrew.com/draft-list-prudential',
    parse: parseTapListTableInline,
  },
  sandwich: {
    name: 'Sandwich (Cape Cod)',
    url: 'https://treehousebrew.com/draft-list-sandwich',
    parse: parseTapListTableInline,
  },
  deerfield: {
    name: 'Deerfield',
    url: 'https://treehousebrew.com/draft-list-deerfield',
    parse: parseTapListDeerfield,
  },
  saratoga: {
    name: 'Saratoga',
    url: 'https://treehousebrew.com/draft-list-saratoga',
    parse: parseTapListUnavailable, // JS-rendered; Jina cannot fetch this content
  },
  woodstock: {
    name: 'Woodstock (CT)',
    url: 'https://treehousebrew.com/draft-list-woodstock',
    parse: parseTapListTableInline,
  },
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

  const { name: locationName, url: draftListUrl, parse } = LOCATIONS[location];

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
    const beers = parse(markdown);

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
