class BreweryTabs {
  constructor(el) {
    this.el = el;
    this.tablinks = el.querySelectorAll('nav [data-tab]');
    this.tabs = el.querySelectorAll('.brewery-tab[data-tab]');

    if (this.tablinks.length < 1 || this.tabs.length < 1) {
      console.warn('[BreweryTabs] No tabs found.');
      return;
    }

    this.setupListeners();
    this.init();
  }

  init() {
    this.tablinks[0].classList.add('active');
    this.tabs[0].classList.add('active');
  }

  setupListeners() {
    this.tablinks.forEach(el => el.addEventListener('click', this.handleNavClick.bind(this)));
  }

  handleNavClick(event) {
    const clicked = event.currentTarget;
    const { tab } = clicked.dataset;

    this.tablinks.forEach(el => {
      if (el === clicked) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    this.tabs.forEach(el => {
      if (el.dataset.tab === tab) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }
}

export default BreweryTabs;
