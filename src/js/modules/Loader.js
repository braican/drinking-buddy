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

    data = data?.data?.response?.user || data?.data?.response || data.data;

    console.log(data);

    this.el.innerHTML = `<pre>${JSON.stringify(data)}</pre>`;
  }
}

export default Loader;
