import Mustache from 'mustache';

import { appRouter } from '../app';
import store from '../store';

class Search {
  constructor() {
    this.body = document.body;
    this.searchEl = document.querySelector('#search');

    this.transitionTiming =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--default-trs-timing') || 0.3,
      ) * 1000;

    if (!this.searchEl) {
      console.warn('No search element found.');
      return;
    }

    this.input = this.searchEl.querySelector('input[type="text"]');
    this.results = this.searchEl.querySelector('[data-results]');
    this.resultsTemplate = this.searchEl.querySelector('script[type="text/template"]');

    // State
    this.searchVisible = false;
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

  /**
   * Show the search interface.
   *
   * @return void
   */
  show() {
    this.body.classList.add('search--visible');
    this.searchVisible = true;

    setTimeout(() => {
      this.input.focus();
      window.scrollTo(0, 0);
    }, this.transitionTiming);

    if (this.breweries.length === 0) {
      store.get('breweries').then(breweries => {
        this.breweries = Object.values(breweries);
      });
    }
  }

  /**
   * Hide the search interface.
   *
   * @return void
   */
  hide() {
    this.body.classList.remove('search--visible');
    this.searchVisible = false;
    this.input.value = '';
    this.results.innerHTML = '';
  }

  handleToggleSearch() {
    if (this.searchVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  handleType(event) {
    const search = event.target.value.toLowerCase();

    if (search.length < 3 || !this.breweries.length > 0) {
      return;
    }

    const results = this.breweries.filter(({ name }) => name.toLowerCase().indexOf(search) > -1);

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
    this.hide();
    appRouter.push(event.target.dataset.href || '/', event.target.dataset);
  }
}

export default Search;
