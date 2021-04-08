import { get } from '../util/req';
import Mustache from 'mustache';

class Loader {
  constructor(id, el) {
    this.id = id;
    this.el = el;

    this.loaded = new Promise(resolve => (this.resolve = resolve));

    this.load();
  }

  load() {
    get(`/api/${this.id}`)
      .then(this.handleSuccess.bind(this))
      .finally(this.resolve)
      .catch(e => {
        console.error('[Something went wrong.]');
        console.error(e);
      });
  }

  handleSuccess({ data }) {
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

    // this.el.innerHTML = `<ul>${this.get}</ul>`;
  }
}

export default Loader;
