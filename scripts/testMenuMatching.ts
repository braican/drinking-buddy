// Regression suite for the menu matcher, run against the live beer catalog.
//
//   npx vite-node scripts/testMenuMatching.ts
//
// Each case is [menu name, menu brewery, expected canonical beer name | null].
// The expectations encode the ways menus and Untappd disagree, and — just as
// importantly — the near-spellings that must NOT match. "Momotaro" is not Oxbow's
// "Momoko"; claiming you've had a beer you haven't is worse than missing one.
//
// Add a case here whenever a real scan gets something wrong, then tune the
// thresholds in src/lib/menuMatcher.ts until the whole suite passes again.

import dotenv from 'dotenv';
import SupabaseClient from '../src/lib/SupabaseClient.ts';
import type { MenuItem } from '../types/menu';

dotenv.config();

type Case = [name: string, brewery: string | null, expected: string | null];

const CASES: Case[] = [
  // Straight from a real scan: exact names, plus the brewery-prefixed canonical.
  ['Corky', 'Fox Farm', 'Corky'],
  ['Draught', 'Guinness', 'Guinness Draught'], // not "Guinness Draught 0.0"
  ['Earl', 'Hill Farmstead', 'Earl'], // not "Works of Love: Earl Grey Tea"
  ['Edward', 'Hill Farmstead', 'Edward'],
  ['Ephraim', 'Hill Farmstead', 'Ephraim'],
  ['Foster', 'Hill Farmstead', 'Foster'],
  ['Mary', 'Hill Farmstead', 'Mary'],

  // Punctuation, diacritics and vintages differ between menu and database.
  ['Society & Solitude #3', 'Hill Farmstead', 'Society & Solitude #3'],
  ['Society and Solitude 3', 'Hill Farmstead', 'Society & Solitude #3'],
  ['Song of Spring', 'Hill Farmstead', 'Song of Spring (2026)'],
  ['Viola Sofia', 'Hill Farmstead', 'Viola Sofia (2024)'],
  ['Witch Meadow Black', 'Fox Farm', 'Witch Meadow Black (2024)'],
  ['Fohn', 'Fox Farm', 'Föhn'],
  ['Avalonia Black', 'Fox Farm', 'Avalonia: Black'],
  ['Works of Love Earl Grey Tea', 'Hill Farmstead', 'Works of Love: Earl Grey Tea'],

  // Brewery credited with a different suffix, case, or abbreviation.
  ['Momoko', 'Oxbow Brewing', 'Momoko'],
  ['Momoko', 'Oxbow Brewing Company', 'Momoko'],
  ['Green Wizard', 'Widowmaker Brewing Co.', 'Green Wizard'],
  ['Green Wizard', 'WIDOWMAKER', 'Green Wizard'],
  ['Edward', 'hill farmstead brewery', 'Edward'],

  // Typos, including transpositions that trigrams alone can't see through.
  ['Edwrad', 'Hill Farmstead', 'Edward'],
  ['Ephriam', 'Hill Farmstead', 'Ephraim'],

  // No brewery credited: the whole catalog is in play, so the bar is higher and
  // short generic names are refused outright.
  ['Momoko', null, 'Momoko'],
  ['Cryptcreeper', null, 'Cryptcreeper'],
  ['Mary', null, null],
  ['Pils', null, null],

  // Near-spellings of genuinely different beers.
  ['Momotaro', 'Oxbow', null],
  ['Marie', 'Hill Farmstead', 'Marie'],
  ['Sumner', 'Hill Farmstead', 'Sumner'],
  ['Susan', 'Hill Farmstead', 'Susan'],
  ['Blue Comet', 'Widowmaker', 'Blue Comet'],
  ['Crystal Comet', 'Widowmaker', 'Crystal Comet'],
  ['Ice Crystals', 'Widowmaker', 'Ice Crystals'],

  // Right brewery, beer never had.
  ['Nonexistent Ghost Beer', 'Hill Farmstead', null],
  ['Double Vermont IPA', 'Fox Farm', null],

  // Beer exists, but at a different brewery than the menu credits.
  ['Edward', 'Oxbow', null],
  ['Corky', 'Widowmaker', null],

  // Brewery isn't in the catalog at all, so nothing from it has been had.
  ['In Absentia', 'Brick & Feather', null],
];

const supabase = new SupabaseClient();

// Only name and brewery affect matching; the rest is filled in to match the shape
// /api/menu/analyze actually sends.
const items: MenuItem[] = CASES.map(([name, brewery]) => ({
  name,
  brewery,
  section: null,
  status: 'available',
  confidence: 'high',
}));

const startedAt = Date.now();
const matches = await supabase.findMenuMatches(items);
const elapsed = Date.now() - startedAt;

let passed = 0;
let failed = 0;

matches.forEach((match, index) => {
  const [name, brewery, expected] = CASES[index];
  const actual = match.beer?.name ?? null;

  if (actual === expected) {
    passed += 1;
    return;
  }

  failed += 1;
  const label = `${brewery ?? '(no brewery)'} / ${name}`;
  console.log(`FAIL  ${label}`);
  console.log(`        got:    ${actual ?? '(no match)'} (${match.score.toFixed(2)})`);
  console.log(`        wanted: ${expected ?? '(no match)'}`);
});

console.log(`\n${passed}/${CASES.length} passed in ${elapsed}ms`);

if (failed) {
  process.exit(1);
}
