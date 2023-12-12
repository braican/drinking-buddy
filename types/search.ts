export interface SearchResult {
  slug: string;
  beer_name?: string;
  brewery_name?: string;
  table_name: 'breweries' | 'beers';
}
