import Router from './modules/Router';
import Loader from './modules/Loader';
import Fetcher from './modules/Fetcher';
import Toggler from './modules/Toggler';
import Search from './modules/Search';

import './store';

import routes from './routes';
export const appRouter = new Router(routes);

const onDataLoad = () => {
  // eslint-disable-next-line
  // console.log('data loaded');
};

// Fire whenever a new page is loaded via the router.
appRouter.on('load', () => {
  const loaders = [];

  // Loaders.
  document.querySelectorAll('[data-loader]').forEach(el => {
    loaders.push(new Loader(el.dataset.loader, el));
  });

  Promise.all(loaders.map(l => l.loaded)).then(onDataLoad);
});

// Initial page load.
(() => {
  // Start search.
  new Search();

  const loaders = [];

  // Load user data.
  const userDataEl = document.querySelector('#app-user-data');
  if (userDataEl) {
    loaders.push(new Loader('userData', userDataEl));
  }

  Promise.all(loaders.map(l => l.loaded)).then(() => {
    // One time listeners.
    document.querySelectorAll('.js-fetch').forEach(el => new Fetcher(el));
    document.querySelectorAll('.js-toggler').forEach(el => new Toggler(el));
  });

  appRouter.init();
})();
