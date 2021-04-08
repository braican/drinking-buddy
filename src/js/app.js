import Loader from './modules/Loader';
import Fetcher from './modules/Fetcher';
import Toggler from './modules/Toggler';

const onDataLoad = () => {
  // Event listeners.
  document.querySelectorAll('.js-fetch').forEach(el => new Fetcher(el));

  // Togglers
  document.querySelectorAll('.js-toggler').forEach(el => new Toggler(el));
};

(() => {
  const loaders = [];

  // Loaders.
  document.querySelectorAll('[data-loader]').forEach(el => {
    loaders.push(new Loader(el.dataset.loader, el));
  });

  Promise.all(loaders.map(l => l.loaded)).then(onDataLoad);
})();
