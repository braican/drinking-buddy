// Holds the current menu scan so you can wander off to a beer page and come back
// to it. Deliberately in-memory rather than sessionStorage: module state survives
// client-side navigation and dies on a page reload, which is exactly the lifetime
// asked for — hitting refresh should give you a clean slate.
//
// Runes rather than a `writable`, unlike the other stores here, because the page
// consuming it is runes-based and this is mutable structured state rather than a
// single value.
//
// Only ever written from browser event handlers. That matters: module state on the
// server is shared across requests, so anything written during load or SSR would
// leak between visitors. Keep the writes client-side.

import type { Brewery, MenuItem, MenuMatch, MenuScanUsage } from '@types';

class ScanStore {
  // The photo. `preview` is an object URL, valid for the life of the document.
  imageFile: File | null = $state(null);
  imagePreview: string | null = $state(null);

  // Scan results.
  items: MenuItem[] = $state([]);
  matches: MenuMatch[] = $state([]);
  menuBrewery: string | null = $state(null);
  usage: MenuScanUsage | null = $state(null);
  scanned = $state(false);

  // In-flight state lives here too, so returning mid-scan shows the loading note
  // rather than an idle page — the request keeps running while you're away.
  analyzing = $state(false);
  matching = $state(false);
  error: string | null = $state(null);

  // Brewery scoping, kept so the field is still filled in when you come back.
  breweryQuery = $state('');
  selectedBrewery: Brewery | null = $state(null);

  // Running totals across every scan this session.
  sessionCost = $state(0);
  scanCount = $state(0);

  /** Replaces the photo, releasing the previous object URL. */
  setImage(file: File) {
    this.releasePreview();
    this.imageFile = file;
    this.imagePreview = URL.createObjectURL(file);
  }

  /** Clears results but keeps the photo, for a re-scan. */
  clearResults() {
    this.items = [];
    this.matches = [];
    this.menuBrewery = null;
    this.usage = null;
    this.scanned = false;
    this.error = null;
  }

  /** Full reset, back to the empty state. Totals survive — they're per session. */
  clear() {
    this.releasePreview();
    this.imageFile = null;
    this.clearResults();
    this.breweryQuery = '';
    this.selectedBrewery = null;
  }

  private releasePreview() {
    if (this.imagePreview) {
      URL.revokeObjectURL(this.imagePreview);
      this.imagePreview = null;
    }
  }
}

const scanStore = new ScanStore();

export default scanStore;
