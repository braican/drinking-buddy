const ACTIVE_TAB_CLASS = 'active';

class Tabs {
  constructor(el) {
    this.tablinks = el.querySelectorAll('nav [data-tab]');
    this.tabs = el.querySelectorAll('.tab[data-tab]');

    if (this.tablinks.length < 1 || this.tabs.length < 1) {
      console.warn('[Tabs] No tabs found.');
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
        el.classList.add(ACTIVE_TAB_CLASS);
      } else {
        el.classList.remove(ACTIVE_TAB_CLASS);
      }
    });

    this.tabs.forEach(el => {
      if (el.dataset.tab === tab) {
        el.classList.add(ACTIVE_TAB_CLASS);
      } else {
        el.classList.remove(ACTIVE_TAB_CLASS);
      }
    });
  }
}

export default Tabs;
