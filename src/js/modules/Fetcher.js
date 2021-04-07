class Fetcher {
  constructor(el) {
    el.addEventListener('click', this.fetch.bind(this));
  }

  fetch() {
    console.log('go get em');
  }
}

export default Fetcher;
