// Matches beer names read off a photographed menu against the canonical names in
// the database. No AI involved — menus and Untappd disagree in predictable ways,
// and those ways are enumerable:
//
//   - Menus drop the corporate suffix: "Fox Farm" vs "Fox Farm Brewery".
//   - Untappd prefixes the brewery onto the beer: menu "Draught" vs "Guinness Draught".
//   - Untappd keeps vintages and parentheticals: "Song of Spring (2026)".
//   - Diacritics and punctuation vary freely: "Soigné", "Bloom'd", "Society & Solitude #3".
//
// The risk runs the other way too. "Momotaro" is not Oxbow's "Momoko" and "Mary"
// is not "Marie", so scoring has to stay tight enough to reject near-spellings
// while absorbing the differences above.

import type { MenuMatchCandidate } from '@types';

// ==============================
// Normalization

/** Corporate noise in brewery names. Stripped from brewery names only — a beer
 *  can legitimately be called "Brewers Reserve". */
const BREWERY_STOPWORDS = new Set([
  'brewery',
  'breweries',
  'brewing',
  'brewers',
  'brewer',
  'brew',
  'brewhouse',
  'beer',
  'beers',
  'company',
  'co',
  'inc',
  'llc',
  'ltd',
  'the',
  'craft',
  'brauerei',
  'brasserie',
  'cerveceria',
  'cervejaria',
  'birra',
]);

/**
 * Lowercases, strips diacritics, and reduces punctuation to spaces so that
 * "Brother Soigné" and "Brother Soigne" — or "Society & Solitude #3" and
 * "Society and Solitude 3" — compare equal.
 */
export function normalize(value: string): string {
  if (!value) return '';

  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // combining marks left behind by NFKD
    .toLowerCase()
    .replace(/[’‘']/g, '') // Bloom'd -> bloomd
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

/** Drops parentheticals and trailing vintage years: "Flora (2017)" -> "flora". */
function stripParentheticals(value: string): string {
  return value
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\b(19|20)\d{2}\b/g, ' ');
}

/** Normalizes a brewery name and removes corporate noise. */
export function normalizeBrewery(value: string): string {
  const tokens = normalize(stripParentheticals(value)).split(' ').filter(Boolean);
  const stripped = tokens.filter(token => !BREWERY_STOPWORDS.has(token));

  // A brewery actually named "The Brewing Co" would strip to nothing.
  return (stripped.length ? stripped : tokens).join(' ');
}

const tokenize = (value: string): string[] => value.split(' ').filter(Boolean);

/** Removes the brewery's own words from a beer name, so the Untappd-style
 *  "Guinness Draught" can meet the menu's "Draught". */
function stripBreweryTokens(beerName: string, breweryName: string): string {
  if (!breweryName) return beerName;

  const breweryTokens = new Set(tokenize(breweryName));
  const kept = tokenize(beerName).filter(token => !breweryTokens.has(token));

  return kept.length ? kept.join(' ') : beerName;
}

// ==============================
// Similarity

/** Trigrams of a space-padded string. Padding makes short names like "mary"
 *  comparable at all. */
function trigrams(value: string): Set<string> {
  const padded = ` ${value} `;
  const grams = new Set<string>();

  for (let i = 0; i < padded.length - 2; i += 1) {
    grams.add(padded.slice(i, i + 3));
  }

  return grams;
}

/** Sørensen–Dice coefficient over two sets. */
function dice<T>(a: Set<T>, b: Set<T>): number {
  if (!a.size || !b.size) return 0;

  let shared = 0;
  a.forEach(value => {
    if (b.has(value)) shared += 1;
  });

  return (2 * shared) / (a.size + b.size);
}

/**
 * How completely the shorter token list sits inside the longer one, penalized by
 * the extra tokens. "draught" inside "guinness draught" scores 0.5, not 1 — full
 * credit is reserved for names that actually agree.
 */
function tokenSubsetScore(a: string, b: string): number {
  const ta = tokenize(a);
  const tb = tokenize(b);
  if (!ta.length || !tb.length) return 0;

  const [shorter, longer] = ta.length <= tb.length ? [ta, tb] : [tb, ta];
  const pool = new Set(longer);
  const matched = shorter.filter(token => pool.has(token)).length;

  return matched / longer.length;
}

/**
 * Damerau–Levenshtein distance — Levenshtein plus transposition as a single edit,
 * which is what makes "Edwrad" one step from "Edward" rather than two.
 */
function editDistance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const d: number[][] = Array.from({ length: rows }, () => new Array(cols).fill(0));

  for (let i = 0; i < rows; i += 1) d[i][0] = i;
  for (let j = 0; j < cols; j += 1) d[0][j] = j;

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);

      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }

  return d[a.length][b.length];
}

/** Below this length, one edit is too large a share of the word to distinguish a
 *  typo from a different beer — "Pils" vs "Pilz", "Mary" vs "Marc". */
const MIN_EDIT_DISTANCE_LENGTH = 6;

/**
 * Only compares single words. Across multi-word names edit distance is far too
 * generous: "brick and feather" sits 8 edits from "dry and bitter", which reads as
 * 53% similar and is enough to make an unrelated brewery look like a candidate.
 * Token overlap and trigrams are the right tools once there's more than one word.
 */
function editSimilarity(a: string, b: string): number {
  if (a.includes(' ') || b.includes(' ')) return 0;

  const longest = Math.max(a.length, b.length);
  if (Math.min(a.length, b.length) < MIN_EDIT_DISTANCE_LENGTH) return 0;

  return 1 - editDistance(a, b) / longest;
}

/** Similarity of two already-normalized strings, in 0..1. */
export function similarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;

  return Math.max(tokenSubsetScore(a, b), dice(trigrams(a), trigrams(b)), editSimilarity(a, b));
}

// ==============================
// Matching

export interface MatchableBeer {
  id: number;
  name: string;
  brewery: number | null;
  hads?: number | null;
  /** Carried through only so a near-miss can be linked for inspection. */
  slug?: string | null;
}

export interface MatchableBrewery {
  id: number;
  name: string;
}

export interface MenuMatchInput {
  name: string;
  brewery?: string | null;
}

export interface MenuMatchResult {
  /** Index into the input array, so callers can rejoin with the original item. */
  index: number;
  beerId: number | null;
  score: number;
  /** Score of the brewery the winning beer belongs to, for debugging thresholds. */
  breweryScore: number;
  /** Whether the credited brewery resolved to anything in the catalog at all. This
   *  separates "never had this brewery" from "had the brewery, not this beer". */
  breweryMatched: boolean;
  /**
   * Beers that were considered and lost, best first, excluding the winner. For a
   * miss these are what it nearly matched; for a hit they're what it chose over.
   */
  alternatives: MenuMatchCandidate[];
}

// A brewery only has to be plausible — the beer name is the real gate, so this
// stays loose enough to let "Hofbräuhaus" reach "Hofbräuhaus Traunstein".
const BREWERY_CANDIDATE_THRESHOLD = 0.45;
/** Accept a beer at or above this score, once its brewery is corroborated. */
const MATCH_THRESHOLD = 0.82;
/** Required when the menu credited no brewery at all and the whole catalog is in
 *  play. A bare name match across 4,800 beers is otherwise a coin flip. */
const UNCORROBORATED_THRESHOLD = 0.95;
/** Worth reporting as "this is what it nearly was". Below this, a candidate shares
 *  so little with the menu name that naming it would be misleading rather than
 *  informative. */
const NEAR_MISS_FLOOR = 0.55;
/** Enough to explain a decision without turning a menu row into a report. */
const MAX_ALTERNATIVES = 3;

interface PreparedBeer extends MatchableBeer {
  variants: string[];
}

/** Precomputes every normalized spelling of a beer name worth comparing against. */
function prepareBeer(beer: MatchableBeer, breweryNames: Map<number, string>): PreparedBeer {
  // Must be the normalized brewery name — stripBreweryTokens compares against
  // already-normalized beer tokens.
  const breweryName =
    beer.brewery !== null ? normalizeBrewery(breweryNames.get(beer.brewery) ?? '') : '';
  const full = normalize(beer.name ?? '');
  const bare = normalize(stripParentheticals(beer.name ?? ''));

  const variants = new Set([
    full,
    bare,
    stripBreweryTokens(full, breweryName),
    stripBreweryTokens(bare, breweryName),
  ]);
  variants.delete('');

  return { ...beer, variants: [...variants] };
}

/**
 * Resolves one menu brewery name to the database breweries that could plausibly
 * be it, scored. Returns an empty map when the menu named no brewery.
 */
function resolveBreweries(
  menuBrewery: string | null | undefined,
  breweries: MatchableBrewery[],
): Map<number, number> {
  const scores = new Map<number, number>();
  if (!menuBrewery) return scores;

  const target = normalizeBrewery(menuBrewery);
  if (!target) return scores;

  for (const brewery of breweries) {
    const score = similarity(target, normalizeBrewery(brewery.name ?? ''));

    if (score >= BREWERY_CANDIDATE_THRESHOLD) {
      scores.set(brewery.id, score);
    }
  }

  return scores;
}

/**
 * Matches each menu item against the beer catalog.
 *
 * Every beer is scored against every item — ~14 items against ~4,800 beers is
 * trivial in-process, and it means a wrong brewery guess can't hide a beer that
 * is genuinely in the catalog.
 */
export function matchMenuItems(
  items: MenuMatchInput[],
  beers: MatchableBeer[],
  breweries: MatchableBrewery[],
): MenuMatchResult[] {
  const breweryNames = new Map<number, string>(breweries.map(b => [b.id, b.name ?? '']));
  const prepared = beers.map(beer => prepareBeer(beer, breweryNames));

  return items.map((item, index) => {
    const breweryScores = resolveBreweries(item.brewery, breweries);
    const namedBrewery = Boolean(item.brewery);

    const itemFull = normalize(item.name ?? '');
    // A menu that writes "Traunstein Helles" under brewery "Hofbräuhaus" is
    // repeating brewery words in the beer name; try it without them too.
    const itemBare = item.brewery
      ? stripBreweryTokens(itemFull, normalizeBrewery(item.brewery))
      : itemFull;
    const itemVariants = [...new Set([itemFull, itemBare])].filter(Boolean);

    const miss = (breweryMatched: boolean): MenuMatchResult => ({
      index,
      beerId: null,
      score: 0,
      breweryScore: 0,
      breweryMatched,
      alternatives: [],
    });

    if (!itemVariants.length) {
      return miss(false);
    }

    // Precision beats recall here: telling someone they've had a beer they
    // haven't is worse than missing one. So when the menu credits a brewery we
    // could resolve, only that brewery's beers are eligible — a name alone is not
    // enough to claim a match. When the credited brewery resolves to nothing, the
    // user has had nothing from them, so there is nothing to find.
    if (namedBrewery && !breweryScores.size) {
      return miss(false);
    }

    // Only reachable with no credited brewery, where the whole catalog is in play.
    // Short generic names ("Mary", "Pils") are too collidable to trust there.
    const distinctive = itemFull.length >= 6 || tokenize(itemFull).length > 1;

    const required = namedBrewery ? MATCH_THRESHOLD : UNCORROBORATED_THRESHOLD;

    // Collected down to NEAR_MISS_FLOOR rather than to the match threshold, so a
    // miss can still say what it nearly was.
    const considered: Ranked[] = [];

    for (const beer of prepared) {
      const breweryScore = beer.brewery !== null ? (breweryScores.get(beer.brewery) ?? 0) : 0;

      if (namedBrewery && breweryScore === 0) continue;
      if (!namedBrewery && !distinctive) continue;

      let score = 0;
      for (const itemVariant of itemVariants) {
        for (const beerVariant of beer.variants) {
          const candidate = similarity(itemVariant, beerVariant);
          if (candidate > score) score = candidate;
        }
      }

      if (score < NEAR_MISS_FLOOR) continue;

      considered.push({ score, beer, breweryScore });
    }

    considered.sort((a, b) => (outranks(a, b) ? -1 : outranks(b, a) ? 1 : 0));

    // `required` is per item, not per beer, so the top-scoring candidate is the
    // match whenever anything qualifies at all.
    const best = considered[0]?.score >= required ? considered[0] : null;
    const alternatives = (best ? considered.slice(1) : considered)
      .slice(0, MAX_ALTERNATIVES)
      .map(candidate => ({
        beerId: candidate.beer.id,
        name: candidate.beer.name,
        slug: candidate.beer.slug ?? null,
        brewery:
          candidate.beer.brewery !== null
            ? (breweryNames.get(candidate.beer.brewery) ?? null)
            : null,
        score: candidate.score,
      }));

    return {
      index,
      beerId: best?.beer.id ?? null,
      score: best?.score ?? 0,
      breweryScore: best?.breweryScore ?? 0,
      breweryMatched: breweryScores.size > 0,
      alternatives,
    };
  });
}

interface Ranked {
  score: number;
  breweryScore: number;
  beer: PreparedBeer;
}

/**
 * Tie-breaks equal-scoring beers. Shortest canonical name first, which is what
 * separates "Guinness Draught" from "Guinness Draught 0.0"; then the one poured
 * more often, which settles duplicate rows.
 */
function outranks(candidate: Ranked, incumbent: Ranked): boolean {
  if (candidate.score !== incumbent.score) return candidate.score > incumbent.score;
  if (candidate.breweryScore !== incumbent.breweryScore) {
    return candidate.breweryScore > incumbent.breweryScore;
  }

  const candidateLength = (candidate.beer.name ?? '').length;
  const incumbentLength = (incumbent.beer.name ?? '').length;
  if (candidateLength !== incumbentLength) return candidateLength < incumbentLength;

  return (candidate.beer.hads ?? 0) > (incumbent.beer.hads ?? 0);
}
