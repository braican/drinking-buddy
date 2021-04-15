import { get } from './util';
import Store from './modules/Store';

const state = {
  /** @var object */
  userData: {},

  /** @var array */
  breweries: [],
};

/**
 * Fetcher functions for state objects. Each function should return an promise.
 */
const fetchers = {
  userData() {
    return get('/api/userData');
  },

  breweries() {
    return get('/api/allBreweries');
  },
};

export default new Store({ state, fetchers });
