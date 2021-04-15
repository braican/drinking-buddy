import { get } from './util';
import Store from './modules/Store';

const state = {
  /** @var object */
  userData: {},

  /** @var array */
  breweries: [],
};

const fetchers = {
  /**
   * Get user data from the API.
   * @returns promise
   */
  userData() {
    return get('/api/userData');
  },
};

export default new Store({ state, fetchers });
