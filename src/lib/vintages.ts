/**
 * Detects "vintage families": groups of beers from one brewery that are yearly releases
 * and/or variants of the same line (Bourbon County Brand Stout and its Coffee, Vanilla,
 * Barleywine… variants across years).
 *
 * Untappd lists each vintage as its own beer, with the year in the name:
 * "Bourbon County Brand Stout (2019)", "Bourbon County Brand Stout (2013) 14.9%",
 * "2017 Barrel-aged Mountain", "BQE (2015 Barrel Aged)". Detection works off those names:
 *
 *   1. Pull the year out of each name, leaving a base name ("Bourbon County Brand Coffee
 *      Stout") and a core name (the base without parentheticals).
 *   2. Within a brewery, link dated beers whose core names share a leading phrase that is
 *      either an entire core name ("Kriek" / "Kriek", "Fanzine" / "Fanzine IPA") or at
 *      least two words that aren't all generic beer words ("Bourbon County Brand…").
 *   3. Pull in the brewery's other beers that contain a family's phrase, dated or not, so
 *      "Bourbon County Brand Stout" with no year and "Proprietor's Bourbon County Brand
 *      Stout (2016)" land in the same family.
 *
 * A family needs at least two beers. `VINTAGE_OVERRIDES` pins down families the heuristic
 * would get wrong.
 */

export interface VintageBeerInput {
  id: number;
  name: string;
  slug: string;
  brewery: number;
  hads?: number | null;
  average?: number | null;
  last_had?: string | Date | null;
  abv?: number | null;
}

export interface VintageBreweryInput {
  id: number;
  name: string;
  slug: string;
}

export interface VintageEntry {
  id: number;
  name: string;
  slug: string;
  year: number | null;
  hads: number;
  average: number | null;
  lastHad: string | null;
  abv: number | null;
}

export interface VintageVariant {
  /** Label with the family phrase removed, e.g. "Coffee Stout". */
  label: string;
  entries: VintageEntry[];
}

export interface VintageFamily {
  slug: string;
  name: string;
  brewery: VintageBreweryInput;
  variants: VintageVariant[];
  /** Distinct years across the family, ascending. */
  years: number[];
  beerCount: number;
  hads: number;
  lastHad: string | null;
}

interface Override {
  /** Brewery slug as stored in the database. */
  brewery: string;
  name: string;
  /** Phrases that put a beer in the family; the first one found is stripped for the label. */
  phrases: string[];
}

/** Families to define by hand rather than detect. */
export const VINTAGE_OVERRIDES: Override[] = [
  {
    brewery: 'goose-island-beer-co',
    name: 'Bourbon County',
    phrases: ['Bourbon County Brand', 'Bourbon County'],
  },
];

/** Words too common to define a family on their own ("Barrel Aged …", "Imperial Stout …"). */
const GENERIC_WORDS = new Set([
  'a',
  'and',
  'the',
  'of',
  'with',
  'w',
  'ba',
  'barrel',
  'barrels',
  'aged',
  'bourbon',
  'rye',
  'whiskey',
  'whisky',
  'rum',
  'brandy',
  'tequila',
  'mezcal',
  'wine',
  'oak',
  'cask',
  'imperial',
  'double',
  'triple',
  'stout',
  'porter',
  'ipa',
  'ale',
  'lager',
  'sour',
  'saison',
  'barleywine',
  'fresh',
  'hop',
  'wet',
  'harvest',
  'vintage',
  'reserve',
  'series',
  'special',
  'edition',
  'batch',
  'blend',
  'coffee',
  'vanilla',
  'chocolate',
  'maple',
  'samuel',
  'adams',
]);

const YEAR_PATTERN = /(?<![\d#])(19[89]\d|20\d\d)(?!\d)/;

interface ParsedName {
  year: number | null;
  /** Name without the year or ABV suffix. */
  base: string;
  /** Base without parentheticals or bracketed tags. */
  core: string;
  coreTokens: string[];
}

export function parseBeerName(name: string, maxYear = new Date().getFullYear() + 1): ParsedName {
  let base = name.replace(/\s+\d{1,2}(\.\d+)?%\s*$/, '');
  let year: number | null = null;

  // A span like "(2011-2017)" is a beer that ran for years, not a vintage.
  const isRange = /(19|20)\d\d\s*[-–]\s*(19|20)\d\d/.test(base);
  const match = isRange ? null : base.match(YEAR_PATTERN);
  if (match && parseInt(match[1]) <= maxYear) {
    year = parseInt(match[1]);
    base = base.slice(0, match.index) + base.slice(match.index + match[1].length);
  }

  base = base
    .replace(/\(\s*[-–—,:|]*\s*/g, '(')
    .replace(/\s*[-–—,:|]*\s*\)/g, ')')
    .replace(/\(\s*\)|\[\s*\]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^[\s\-–—:|,]+|[\s\-–—:|,]+$/g, '')
    .trim();

  const core =
    base
      .replace(/\([^)]*\)|\[[^\]]*\]/g, '')
      .replace(/\s+/g, ' ')
      .trim() || base;

  return { year, base, core, coreTokens: tokenize(core) };
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .split(/[\s\-–—/]+/)
    .map(t => t.replace(/[^\p{L}\p{N}]/gu, ''))
    .filter(Boolean);
}

function commonPrefix(a: string[], b: string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < Math.min(a.length, b.length) && a[i] === b[i]; i++) out.push(a[i]);
  return out;
}

function isStrongPhrase(tokens: string[]): boolean {
  return tokens.length >= 2 && tokens.some(t => !GENERIC_WORDS.has(t));
}

function containsSequence(haystack: string[], needle: string[]): number {
  outer: for (let i = 0; i <= haystack.length - needle.length; i++) {
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) continue outer;
    }
    return i;
  }
  return -1;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Removes the leading tokens of `text` that match `phrase`, or the first occurrence of it. */
function stripPhrase(text: string, phrase: string[]): string {
  const words = text.split(/\s+/);
  const wordTokens = words.map(w => tokenize(w).join(''));
  // Tokenize can split a word ("3-Way" → "3","way"); compare on joined tokens instead.
  const flatPhrase = phrase.join('');
  for (let start = 0; start < words.length; start++) {
    let joined = '';
    for (let end = start; end < words.length; end++) {
      joined += wordTokens[end];
      if (joined === flatPhrase) {
        const rest = [...words.slice(0, start), ...words.slice(end + 1)].join(' ');
        return rest.replace(/^[\s\-–—:|,]+|[\s\-–—:|,]+$/g, '').trim();
      }
      if (!flatPhrase.startsWith(joined)) break;
    }
  }
  return text;
}

interface Candidate {
  beer: VintageBeerInput;
  parsed: ParsedName;
}

/** Groups beers into vintage families. */
export function detectVintageFamilies(
  beers: VintageBeerInput[],
  breweries: VintageBreweryInput[],
): VintageFamily[] {
  const breweryById = new Map(breweries.map(b => [b.id, b]));
  const byBrewery = new Map<number, Candidate[]>();

  for (const beer of beers) {
    if (!beer.name || !breweryById.has(beer.brewery)) continue;
    const list = byBrewery.get(beer.brewery) ?? [];
    list.push({ beer, parsed: parseBeerName(beer.name) });
    byBrewery.set(beer.brewery, list);
  }

  const families: VintageFamily[] = [];

  for (const [breweryId, candidates] of byBrewery) {
    const brewery = breweryById.get(breweryId)!;
    const claimed = new Set<number>();

    // Hand-defined families claim their beers first.
    for (const override of VINTAGE_OVERRIDES.filter(o => o.brewery === brewery.slug)) {
      const phrases = override.phrases.map(tokenize);
      const members: { candidate: Candidate; phrase: string[] }[] = [];
      for (const candidate of candidates) {
        if (claimed.has(candidate.beer.id)) continue;
        const tokens = tokenize(candidate.parsed.base);
        const phrase = phrases.find(p => containsSequence(tokens, p) >= 0);
        if (phrase) members.push({ candidate, phrase });
      }
      if (members.length) {
        members.forEach(m => claimed.add(m.candidate.beer.id));
        families.push(buildFamily(override.name, brewery, members));
      }
    }

    const dated = candidates.filter(c => c.parsed.year !== null && !claimed.has(c.beer.id));
    if (!dated.length) continue;

    // Union-find over dated beers linked by a shared leading phrase.
    const parent = dated.map((_, i) => i);
    const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));

    for (let i = 0; i < dated.length; i++) {
      for (let j = i + 1; j < dated.length; j++) {
        const a = dated[i].parsed.coreTokens;
        const b = dated[j].parsed.coreTokens;
        const prefix = commonPrefix(a, b);
        const wholeName =
          prefix.length > 0 && (prefix.length === a.length || prefix.length === b.length);
        if (wholeName || isStrongPhrase(prefix)) parent[find(i)] = find(j);
      }
    }

    const groups = new Map<number, Candidate[]>();
    dated.forEach((c, i) => {
      const root = find(i);
      groups.set(root, [...(groups.get(root) ?? []), c]);
    });

    const pending: { phrase: string[]; members: Candidate[] }[] = [];
    for (const members of groups.values()) {
      const phrase = members
        .map(m => m.parsed.coreTokens)
        .reduce((acc, tokens) => commonPrefix(acc, tokens));
      if (!phrase.length) continue;
      pending.push({ phrase, members });
    }

    // Longer phrases claim first so a specific family isn't swallowed by a looser one.
    pending.sort((a, b) => b.phrase.length - a.phrase.length);

    for (const group of pending) {
      const ids = new Set(group.members.map(m => m.beer.id));
      if ([...ids].some(id => claimed.has(id))) continue;

      const members = [...group.members];
      const exactCore = group.members.some(m => m.parsed.coreTokens.length === group.phrase.length);

      // Pull in other beers that carry the phrase: undated releases of the same beer,
      // or names with something in front ("Proprietor's Bourbon County…").
      for (const candidate of candidates) {
        if (ids.has(candidate.beer.id) || claimed.has(candidate.beer.id)) continue;
        const tokens = candidate.parsed.coreTokens;
        const at = containsSequence(tokens, group.phrase);
        if (at < 0) continue;
        const sameBeer = at === 0 && tokens.length === group.phrase.length && exactCore;
        if (sameBeer || isStrongPhrase(group.phrase)) {
          members.push(candidate);
          ids.add(candidate.beer.id);
        }
      }

      if (members.length < 2) continue;

      members.forEach(m => claimed.add(m.beer.id));
      const name = displayPhrase(group.members[0].parsed.core, group.phrase.length);
      families.push(
        buildFamily(
          name,
          brewery,
          members.map(candidate => ({ candidate, phrase: group.phrase })),
        ),
      );
    }
  }

  return families.sort((a, b) => b.beerCount - a.beerCount || a.name.localeCompare(b.name));
}

/** The original-cased words of `core` that make up its first `count` tokens. */
function displayPhrase(core: string, count: number): string {
  const words = core.split(/\s+/);
  const out: string[] = [];
  let seen = 0;
  for (const word of words) {
    if (seen >= count) break;
    out.push(word);
    seen += tokenize(word).length;
  }
  return out.join(' ').replace(/[\s\-–—:|,]+$/, '');
}

function buildFamily(
  name: string,
  brewery: VintageBreweryInput,
  members: { candidate: Candidate; phrase: string[] }[],
): VintageFamily {
  const variants = new Map<string, VintageVariant>();

  for (const { candidate, phrase } of members) {
    const { beer, parsed } = candidate;
    const label =
      stripPhrase(parsed.base, phrase)
        .replace(/^[([](.*)[)\]]$/, '$1')
        .trim() || 'Original';
    const key = tokenize(label).join(' ') || label.toLowerCase();
    const variant = variants.get(key) ?? { label, entries: [] };

    variant.entries.push({
      id: beer.id,
      name: beer.name,
      slug: beer.slug,
      year: parsed.year,
      hads: beer.hads ?? 0,
      average: beer.average ?? null,
      lastHad: beer.last_had ? new Date(beer.last_had).toISOString() : null,
      abv: beer.abv ?? null,
    });
    variants.set(key, variant);
  }

  const variantList = [...variants.values()];
  variantList.forEach(v => v.entries.sort((a, b) => (a.year ?? 0) - (b.year ?? 0)));
  // Most-had variant first; that's usually the flagship.
  variantList.sort(
    (a, b) =>
      b.entries.length - a.entries.length ||
      sum(b.entries.map(e => e.hads)) - sum(a.entries.map(e => e.hads)) ||
      a.label.localeCompare(b.label),
  );

  const entries = variantList.flatMap(v => v.entries);
  const years = [
    ...new Set(entries.map(e => e.year).filter((y): y is number => y !== null)),
  ].sort();
  const lastHad =
    entries
      .map(e => e.lastHad)
      .filter(Boolean)
      .sort()
      .at(-1) ?? null;

  return {
    slug: `${brewery.slug}--${slugify(name)}`,
    name,
    brewery,
    variants: variantList,
    years,
    beerCount: entries.length,
    hads: sum(entries.map(e => e.hads)),
    lastHad,
  };
}

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}
