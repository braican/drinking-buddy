import Mustache from 'mustache';
import store from '../../store';
import beerlist from '../../../partials/beerlist.html';

const SELECTING_CLASS = 'selecting';

class BeerSort {
  constructor(el) {
    this.sortControl = el.querySelectorAll('.js-beer-sort-control');
    this.sortOptions = el.querySelectorAll('.js-beer-sort-options button[data-sort]');
    this.beerlist = el.querySelector('.js-beerlist');
    this.sortDisplay = el.querySelector('.js-beer-sort-display');

    this.setupListeners();
  }

  setupListeners() {
    this.sortControl.forEach(el => el.addEventListener('click', this.showSortOptions.bind(this)));
    this.sortOptions.forEach(el => el.addEventListener('click', this.handleSortChange.bind(this)));
    document.addEventListener('click', this.handleOffClick.bind(this));
  }

  handleOffClick(event) {
    if (
      event.target.closest('.js-beer-sort-options') === null &&
      event.target.closest('.js-beer-sort-control') === null
    ) {
      this.hideSortOptions();
    }
  }

  showSortOptions() {
    this.sortControl.forEach(el => el.parentElement.classList.add(SELECTING_CLASS));
  }
  hideSortOptions() {
    this.sortControl.forEach(el => el.parentElement.classList.remove(SELECTING_CLASS));
  }

  handleSortChange(event) {
    const { sort } = event.currentTarget.dataset;
    const label = event.currentTarget.innerText;

    store.get('brewery_data').then(({ beers }) => {
      const sorted = beers.sort((a, b) => {
        if (sort === 'rating' && a.rating !== b.rating) {
          return a.rating > b.rating ? -1 : 1;
        }

        if (sort === 'hads' && a.checkinCount !== b.checkinCount) {
          return a.checkinCount > b.checkinCount ? -1 : 1;
        }

        return a.beer > b.beer ? 1 : -1;
      });

      this.sortDisplay.innerText = label;
      this.hideSortOptions();

      this.beerlist.innerHTML = Mustache.render(beerlist, {
        beers: sorted,
        formatDateShort: () => (data, render) => {
          const date = new Date(render(data));
          return date.toLocaleString('en-US', { dateStyle: 'medium' });
        },
      });
    });
  }
}

export default BeerSort;
