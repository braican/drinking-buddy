class Toggler {
  constructor(el) {
    this.button = el;
    this.target = document.querySelectorAll(`.${el.dataset.class}`);

    // state.
    this.visible = false;

    this.setupListeners();
  }

  setupListeners() {
    this.button.addEventListener('click', this.handleClick.bind(this));
  }

  handleClick() {
    if (this.visible) {
      this.visible = false;
      this.target.forEach(el => (el.style.display = 'none'));
      this.button.classList.remove('toggled');
    } else {
      this.visible = true;
      this.target.forEach(el => (el.style.display = 'block'));
      this.button.classList.add('toggled');
    }
  }
}

export default Toggler;
