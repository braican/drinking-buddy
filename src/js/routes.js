import home from '../pages/home.html';
import notfound from '../pages/404.html';
import brewery from '../pages/brewery.html';

const routes = {
  '/': {
    page: home,
  },
  '/brewery/*': {
    page: brewery,
  },
  '*': {
    page: notfound,
  },
};

export default routes;
