import Loader from './modules/Loader';
import Fetcher from './modules/Fetcher';

(() => {
  // Loaders.
  document.querySelectorAll('[data-loader]').forEach(el => new Loader(el.dataset.loader, el));

  // Event listeners.
  document.querySelectorAll('.js-fetch').forEach(el => new Fetcher(el));
})();
