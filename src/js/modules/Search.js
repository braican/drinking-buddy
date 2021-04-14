import { get } from '../util/req';
import Mustache from 'mustache';

import { appRouter } from '../app';

class Search {
  constructor() {
    this.body = document.body;
    this.searchEl = document.querySelector('#search');

    if (!this.searchEl) {
      console.warn('No search element found.');
      return;
    }

    this.input = this.searchEl.querySelector('input[type="text"]');
    this.results = this.searchEl.querySelector('[data-results]');
    this.resultsTemplate = this.searchEl.querySelector('script[type="text/template"]');

    // State
    this.searchVisible = false;
    this.breweriesLoaded = false;
    this.breweries = [];

    // Go.
    this.setupListeners();
  }

  setupListeners() {
    document
      .querySelectorAll('.js-toggle-search')
      .forEach(el => el.addEventListener('click', this.handleToggleSearch.bind(this)));

    this.input.addEventListener('input', this.handleType.bind(this));

    this.results.addEventListener('click', this.handleResultClick.bind(this));
  }

  handleToggleSearch() {
    if (this.searchVisible) {
      this.body.classList.remove('search--visible');
      this.searchVisible = false;
    } else {
      this.body.classList.add('search--visible');
      this.searchVisible = true;
      this.input.focus();

      if (!this.breweriesLoaded) {
        get('api/allBreweries').then(res => {
          this.breweriesLoaded = true;
          this.breweries = Object.values(res.data);
        });
      }
    }
  }

  handleType(event) {
    const search = event.target.value.toLowerCase();

    if (search.length < 3 || !this.breweriesLoaded) {
      return;
    }

    const results = this.breweries.filter(b => b.toLowerCase().indexOf(search) > -1);

    if (this.resultsTemplate) {
      const rendered = Mustache.render(this.resultsTemplate.innerHTML, { results });
      this.results.innerHTML = rendered;
    }
  }

  handleResultClick(event) {
    if (event.target.tagName !== 'A') {
      return;
    }

    event.preventDefault();
    appRouter.push(event.target.dataset.href || '/');
  }
}

export default Search;
