import { post } from '../../../util/req';

class Fetcher {
  constructor(el) {
    el.addEventListener('click', this.fetch.bind(this));
  }

  fetch() {
    post('api/fetch')
      .then(res => {
        // eslint-disable-next-line
        console.log(res);
      })
      .catch(console.error);
  }
}

export default Fetcher;
