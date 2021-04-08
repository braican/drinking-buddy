import { get } from '../../../util/req';

class Loader {
  constructor(id, el) {
    this.id = id;
    this.el = el;
    this.load();
  }

  load() {
    get(`/api/${this.id}`)
      .then(this.handleSuccess.bind(this))
      .catch(e => {
        console.error('[Something went wrong.]');
        console.error(e);
      });
  }

  handleSuccess(data) {
    const loading = this.el.querySelector('.js-loading');

    if (loading) {
      loading.remove();
    }

    this.el.innerHTML = JSON.stringify(data);
  }
}

export default Loader;
