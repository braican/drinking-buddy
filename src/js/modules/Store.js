/**
 * Store state and other data.
 */
class Store {
  /**
   * Kick off the store.
   *
   * @param {object} config Set up the store.
   *   @property {object} state    Default state.
   *   @property {object} fetchers Fetchers for state objects.
   */
  constructor(config) {
    this.state = config.state || {};
    this.fetchers = config.fetchers || {};
    this.usedFetchers = {};

    Object.keys(this.fetchers).forEach(key => (this.usedFetchers[key] = false));
  }

  /**
   * Gets data from the store. If it's not there, use the appropriate fetcher.
   *
   * @visibility public
   *
   * @param {string} key State object to get.
   * @param {object} params Additional parameters.
   *
   * @return promise
   */
  get(key) {
    if (this.state[key] && this.usedFetchers[key] !== false) {
      return Promise.resolve(this.state[key]);
    }

    return this.fetch(key);
  }

  /**
   * Get data with the assigned fetcher.
   *
   * @returns promise
   */
  fetch(key) {
    if (!this.fetchers[key]) {
      return Promise.resolve(null);
    }

    if (typeof this.fetchers[key] !== 'function') {
      return Promise.reject('[Error] Fetcher must be a function.');
    }

    const fetcher = this.fetchers[key]();

    if (typeof fetcher !== 'object' || typeof fetcher.then !== 'function') {
      return Promise.resolve(fetcher);
    }

    return fetcher.then(data => {
      this.state[key] = data;
      return data;
    });
  }
}

export default Store;
