class Search {
  constructor() {
    this.body = document.body;
    this.searchEl = document.querySelector('#search');

    if (!this.searchEl) {
      console.warn('No search element found.');
      return;
    }

    this.input = this.searchEl.querySelector('input[type="text"]');

    // State
    this.searchVisible = false;

    // Go.
    this.setupListeners();
  }

  setupListeners() {
    document
      .querySelectorAll('.js-toggle-search')
      .forEach(el => el.addEventListener('click', this.handleToggleSearch.bind(this)));

    this.input.addEventListener('input', this.handleType.bind(this));
  }

  handleToggleSearch() {
    if (this.searchVisible) {
      this.body.classList.remove('search--visible');
      this.searchVisible = false;
    } else {
      this.body.classList.add('search--visible');
      this.searchVisible = true;
      this.input.focus();
    }
  }

  handleType(event) {
    console.log(event.target.value);
  }
}

export default Search;
