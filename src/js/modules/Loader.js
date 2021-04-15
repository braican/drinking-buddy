import Mustache from 'mustache';
import { get } from '../util';
import store from '../store';

class Loader {
  constructor(id, el) {
    this.id = id;
    this.el = el;
    this.params = el.dataset;

    delete this.params.loader;

    this.loaded = new Promise(resolve => (this.resolve = resolve));

    this.load();
  }

  load() {
    store
      .get(this.id, this.params)
      // Check that the store has the data. If it doesn't, fetch it from the API.
      .then(res => (res !== null ? Promise.resolve(res) : get(`/api/${this.id}`, this.params)))
      .then(this.handleSuccess.bind(this))
      .finally(this.resolve)
      .catch(e => {
        console.error('[Something went wrong in the loader]');
        console.error(e);
      });
  }

  handleSuccess(data) {
    const loading = this.el.querySelector('.js-loading');
    const template = this.el.querySelector('script[type="text/template"]');

    if (loading) {
      loading.remove();
    }

    // eslint-disable-next-line
    console.log(data);

    if (template) {
      const rendered = Mustache.render(template.innerHTML, data);
      this.el.innerHTML = rendered;
    }
  }
}

export default Loader;
