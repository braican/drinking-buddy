import Fetcher from './modules/Fetcher';

(() => {
  document.querySelectorAll('.js-fetch').forEach(el => new Fetcher(el));
})();
